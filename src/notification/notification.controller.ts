import NotificationService from "./notification.service";
import { IPermission } from "../utils/permission.inteface";

export default class NotificationController {
    static async notify(permission: IPermission) {
        NotificationService.sendNotification(permission.Creator, permission.UserID);
    }
}
