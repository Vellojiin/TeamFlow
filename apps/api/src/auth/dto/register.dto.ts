import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class RegisterDTO{

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: "Johan Navarro",
        minLength: 3,
        maxLength: 50,
    })
    @IsString()
    @MinLength(3)
    @Length(3, 50)
    name!: string;

    @ApiProperty({
        example: "password123",
        minLength: 8
    })
    @IsString()
    @MinLength(8)
    password!: string;

}