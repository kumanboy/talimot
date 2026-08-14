import "server-only";

import {
    AdminTestDraftService,
} from "./admin-test-draft-service";
import {
    DrizzleAdminTestDraftRepository,
} from "./drizzle-admin-test-draft-repository";

export const adminTestDraftRepository =
    new DrizzleAdminTestDraftRepository();

export const adminTestDraftService =
    new AdminTestDraftService(
        adminTestDraftRepository,
    );
