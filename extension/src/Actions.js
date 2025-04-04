import Requests from "./Requests.js";
import RequestsUtils from "./utils/RequestsUtils.js";
import Utils from "./utils/Utils.js";

const Actions = new class {
    async visitProfile(username){
       await this._visitThroughSearch(username)
    }
    async _visitThroughSearch(username){
        await RequestsUtils.openSearch();
        await RequestsUtils.waitForSelector(RequestsUtils.SELECTORS.SEARCH_INPUT);
        await RequestsUtils.typeInSearch(username);
    }

    async createPost(fileUrl, caption){
        await RequestsUtils.waitForSelector(RequestsUtils.SELECTORS.CREATE_POST_BUTTON);
        await RequestsUtils.openNewPost();
        await Utils.sleep(1000);
        await RequestsUtils.clickConfirmPostCreationIfPresent();
        await Utils.sleep(1000);
        await RequestsUtils.waitForSelector(RequestsUtils.SELECTORS.CREATE_POST_FILE_UPLOAD);
        await RequestsUtils.simulateImageDragAndDrop(fileUrl);

        await Utils.sleep(1000);
        await RequestsUtils.waitForSelector(RequestsUtils.SELECTORS.CREATE_POST_CUT_SECTION);
        await Utils.sleep(1000);
        await RequestsUtils.postCreationOpenCutSection()
        await Utils.sleep(1000);
        await RequestsUtils.postCreationCutSectionOriginalDimensions()
        await Utils.sleep(1000);

        await RequestsUtils.clickNextStepInPostCreation();
        await Utils.sleep(1000);
        await RequestsUtils.clickNextStepInPostCreation();
        await Utils.sleep(1000);
        await RequestsUtils.typeInCaption(caption);
        await Utils.sleep(1000);
        await RequestsUtils.clickNextStepInPostCreation();
        await RequestsUtils.waitForSelector(RequestsUtils.SELECTORS.POST_CREATED, 60_000);
    }

}

export default Actions;