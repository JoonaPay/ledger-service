import { ApiProperty } from "@nestjs/swagger";
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
} from "class-validator";

export class DeleteTransactionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  id: string;
}