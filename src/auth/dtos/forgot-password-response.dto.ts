import { ApiProperty } from '@nestjs/swagger';

/**
 * Forgot Password Response DTO
 *
 * Generic response returned after a password reset request.
 */
export class ForgotPasswordResponseDto {
  @ApiProperty({
    example: 'If an account exists for this email, a reset link has been sent.',
    description:
      'Generic success message returned to avoid user enumeration by email',
    type: String,
  })
  message: string;
}
