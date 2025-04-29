import endpoints from "../services/endpoints";

export class ChallengesController {
    constructor(api){
        this.api = api
    }

    async createChallenger(){
        await this.api.auth(endpoints.getToken)
    }

    async getAllChallenges(){
        return await this.api.get(endpoints.getAllChallenges)
    }

    async getChallengerProgress(){
        return await this.api.get(endpoints.checkTokenExisting(this.api.token));
    }

    async getChallengerTodosDatabase(){
        return await this.api.get(endpoints.restoreCurrentTodos(this.api.token));
    }

    async putChallengerWithProgress(challengerGuid, payload){
        return await this.api.put(endpoints.checkTokenExisting(challengerGuid), payload);
    }

    async putChallengesToDatabase(payload){
        return await this.api.put(endpoints.restoreCurrentTodos(this.api.token), payload);
    }

    async getChallengesNotPlural(){
        return await this.api.get(endpoints.getToDoNotPlural);
    }

    async restoreChallengerProgress(payload){
        return await this.api.put(endpoints.checkTokenExisting(this.api.token), payload);
    }
}