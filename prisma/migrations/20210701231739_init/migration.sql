-- CreateTable
CREATE TABLE "poker_tables" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "bigBlind" INTEGER NOT NULL,
    "minPlayers" INTEGER NOT NULL DEFAULT 2,
    "maxPlayers" INTEGER NOT NULL DEFAULT 9,
    "active" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "avatar_url" VARCHAR DEFAULT E'https://unhbhljqbvrcoyrtsprm.supabase.co/storage/v1/object/sign/avatars/8bb8fbad389f6e38165751fe43659169fe688dda_full.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzLzhiYjhmYmFkMzg5ZjZlMzgxNjU3NTFmZTQzNjU5MTY5ZmU2ODhkZGFfZnVsbC5qcGciLCJpYXQiOjE2MjUxMzk5MzIsImV4cCI6MTk0MDQ5OTkzMn0.hJVikTpPQdXZ4tJK0skvwaDCMzxQojJ5ih_IlveY-cc',

    PRIMARY KEY ("id")
);
