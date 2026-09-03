import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginDTO {

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: "password123",
        minLength: 8
    })
    @IsString()
    @MinLength(8)
    password!: string;
}