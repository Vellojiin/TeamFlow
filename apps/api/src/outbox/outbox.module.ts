import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { QueueModule } from "../queue/queue.module";
import { OutboxPublisher } from "./outbox.publisher";

@Module({
    imports: [
    DatabaseModule,
    QueueModule,
    ],
    providers: [OutboxPublisher],
})
export class OutboxModule {}