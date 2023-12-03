import dynamoDBClient from "../models/connection";
import UserServerice from "./user.services"

const userService = new UserServerice(dynamoDBClient());
export default userService;