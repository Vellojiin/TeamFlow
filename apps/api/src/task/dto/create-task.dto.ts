import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
    example: "Implementar pagina de inicio",
    minLength: 2,
    maxLength: 200,
    })
    @IsString()
    @Length(2, 200)
    title!: string;

    @ApiPropertyOptional({
    example: "Crear el formulario de inicio de sesión y conectarlo a la API",
    })
    @IsOptional()
    @IsString()
    @Length(0, 5000)
    description?: string;

    @ApiPropertyOptional({
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    example: 'MEDIUM',
    })
    @IsOptional()
    @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';

    @ApiPropertyOptional({
    example: "2026-09-15T18:00:00.000Z",
    })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({
    example: "clxxxxxxxxxxxxxxxxxxxx",
    description: "ID del usuario asignado a esta tarea",
    })
    @IsOptional()
    @IsString()
    assigneeId?: string;
}