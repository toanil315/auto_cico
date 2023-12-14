import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { User } from './model';
import * as CryptoJS from 'crypto-js';

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
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoCI() {
    return this.handleAutoCICO();
  }

  @Cron('0 30 15 * * 1-5', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoCO() {
    console.log('============CO');
    return this.handleAutoCICO();
  }

  async handleAutoCICO() {
    const users = await this.service.getUsers();
    for (const user of users) {
      if (user.is_active) {
        this.executeCICO(user);
      }
    }
  }

  async executeCICO(user: User, recall: boolean = true) {
    try {
      console.log('===== CO for user ', user.id);
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
