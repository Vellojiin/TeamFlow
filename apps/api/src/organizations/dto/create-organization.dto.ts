import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class CreateOrganizationDto {
    @ApiProperty({
    example: "Acme Corporation",
    minLength: 2,
    maxLength: 100,
    })
    @IsString()
    @Length(2, 100)
    name!: string;

    @ApiProperty({
    example: "acme-corporation",
    description: "Unique URL-friendly identifier",
    })
    @IsString()
    @Length(2, 50)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
        "slug must contain only lowercase letters, numbers and hyphens",
    })
    slug!: string;
}