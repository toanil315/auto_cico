import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { User } from './model';
import * as CryptoJS from 'crypto-js';
import * as dayjs from 'dayjs';
import { DURATION_ENUM } from './constant';

@Injectable()
export class AutoCICOJob {
  private CICO_LOCATION = {
    address:
      '01, Đường Lê Đình Lý, Phường Vĩnh Trung, Thanh Khê District, Đà Nẵng, 50207, Vietnam',
    latitude: 16.059117699050617,
    longitude: 108.21127770211855,
    type: 2,
  };

  constructor(private readonly service: AppService) {}

  @Cron('0 30 8 * * 1-5', {
    timeZone: 'Asia/Saigon',
  })
  async autoCI() {
    return this.handleAutoCICO('early');
  }

  @Cron('0 15 13 * * 1-5', {
    timeZone: 'Asia/Saigon',
  })
  async autoCiOrCo() {
    return this.handleAutoCICO('mid');
  }

  @Cron('0 30 17 * * 1-5', {
    timeZone: 'Asia/Saigon',
  })
  async autoCO() {
    return this.handleAutoCICO('late');
  }

  @Cron('0 0 23 * * 7', {
    timeZone: 'Asia/Saigon',
  })
  async clearOutDateLeaves() {
    const now = Date.now();
    const leaves = await this.service.getLeaves();
    const needDeleteLeaves = leaves.filter(
      (leave) => dayjs(leave.to).valueOf() < now,
    );
    needDeleteLeaves.forEach((leave) => {
      this.service.deleteLeave(leave.id);
    });
  }

  async handleAutoCICO(section: 'early' | 'mid' | 'late') {
    const users = await this.service.getUsers();
    for (const user of users) {
      if (user.is_active) {
        const cicoConfigs = await this.checkLeaveForSkippingCICO(user.id);
        if (cicoConfigs[section]) {
          this.executeCICO(user);
        }
      }
    }
  }

  async checkLeaveForSkippingCICO(userId: string) {
    const leaves = await this.service.getLeaves();
    const currentDay = dayjs().format('MM/DD/YYYY');
    const currentDayLeave = leaves.filter(
      (leave) => leave.user === userId && leave.from === currentDay,
    )?.[0];
    if (currentDayLeave) {
      switch (currentDayLeave.duration) {
        case DURATION_ENUM.FULL_DAY:
          return { early: false, mid: false, late: false };

        case DURATION_ENUM.MORNING:
          return { early: false, mid: true, late: true };

        case DURATION_ENUM.AFTERNOON:
          return { early: true, mid: true, late: false };
      }
    }

    return { early: true, mid: true, late: true };
  }

  async executeCICO(user: User, recall: boolean = true) {
    try {
      await axios.post(
        'https://api-hcm.banvien.com.vn/gatewayapp/ci-co',
        this.CICO_LOCATION,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        },
      );
    } catch (error) {
      if (recall) {
        const newUser = await this.handleReAuth(user);
        this.executeCICO(newUser, false);
      }
    }
  }

  async handleReAuth(user: User) {
    const secret = await this.preFlight(user.id);
    const key = CryptoJS.enc.Base64.parse(secret).toString(CryptoJS.enc.Utf8);
    const { data } = await axios.post(
      'https://api-hcm.banvien.com.vn/gatewayapp/auth',
      {
        username: user.id,
        password: CryptoJS.AES.encrypt(user.pwd, key).toString(
          CryptoJS.format.OpenSSL,
        ),
        is_external: false,
      },
    );
    const newUser = {
      ...user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
    await this.service.upsertUser(newUser);

    return newUser;
  }

  async preFlight(userName: string): Promise<string> {
    const { data } = await axios.post(
      'https://api-hcm.banvien.com.vn/gatewayapp/auth/pre-flight',
      {
        data: userName,
      },
    );
    return data.data.secret;
  }
}
