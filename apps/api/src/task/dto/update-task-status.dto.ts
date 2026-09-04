import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class UpdateTaskStatusDto {
    @ApiProperty({
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    example: 'IN_PROGRESS',
    })
    @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
    status!: 'TODO' | 'IN_PROGRESS' | 'DONE';
}