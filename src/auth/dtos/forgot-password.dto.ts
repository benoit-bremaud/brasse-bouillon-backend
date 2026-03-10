import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

/**
 * Forgot Password DTO
 *
 * Payload used to request a password reset email.
 */
export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address linked to the account',
    type: String,
  })
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    },
  )
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
