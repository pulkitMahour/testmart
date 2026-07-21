import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { TestResetGuard } from './test-reset.guard';

// Test-support endpoints. Guarded so they do nothing on a public deploy (see TestResetGuard).
@Controller('test')
export class TestController {
  constructor(private readonly test: TestService) {}

  @Post('reset')
  @HttpCode(200)
  @UseGuards(TestResetGuard)
  reset() {
    return this.test.reset();
  }
}
