import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { toUserResponse } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  createUser(data: { name: string; email: string; password: string }) {
    // create() triggers the password-hashing pre-save hook.
    return this.userModel.create({ ...data, email: data.email.toLowerCase().trim() });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.address) user.address = { ...user.address, ...dto.address } as any;
    if (dto.password) user.password = dto.password; // re-hashed by the pre-save hook

    await user.save();
    return toUserResponse(user);
  }

  // ---- Admin operations ----

  count() {
    return this.userModel.countDocuments();
  }

  async findAllSafe() {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map(toUserResponse);
  }

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { message: 'User deleted', id };
  }
}
