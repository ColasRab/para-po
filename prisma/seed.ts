import { db } from "@/db/index";
import { communities, forumTags, rewardCategory, rewards, user } from "./json/export";
const prismaUserCategory = db.user.createMany({
    data: user
});

const prismaRewardCategory = db.rewardCategory.createMany({
    data: rewardCategory
});

const prismaRewards = db.reward.createMany({
    data: rewards
});

const prismaCommunities = db.community.createMany({
    data: communities
});

const prismaForumTags = db.forumTag.createMany({
    data: forumTags
});

type BatchPayload = {
    count: number;
};
function throwAllSettledError(res: PromiseSettledResult<BatchPayload>) {
    if (res.status === "rejected")
        throw new Error(res.reason);
}

async function main() {
    try {
        console.log("Populating database...");
        const res0 = await Promise.allSettled([
            prismaUserCategory,
        ]);

        res0.forEach(throwAllSettledError);

        const res1 = await Promise.allSettled([
            prismaRewardCategory,
            prismaForumTags,
        ]);
        res1.forEach(throwAllSettledError);
        console.log("Populated round 1");

        const res2 = await Promise.allSettled([
            prismaRewards,
            prismaCommunities,
        ]);
        res2.forEach(throwAllSettledError);
        console.log("Populated round 2");
        console.log("Database populated!");
    } catch (err) {
        console.log(err);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });