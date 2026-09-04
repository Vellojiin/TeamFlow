import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Length, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
    @ApiProperty({ example: 'Nombre del proyecto',
        minLength: 2,
        maxLength: 50,
    })
    @IsString()
    @Length(2, 50)
    name!: string;

    @ApiPropertyOptional({ example: 'Descripción del proyecto' })
    @IsOptional()
    @IsString()
    @Length(0, 200)
    description?: string;
}