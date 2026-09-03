import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class AddMemberDto {
    @ApiProperty({ example: 'member@example.com', description: 'Email del miembro a agregar' })
    @IsEmail()
    email!: string;
}