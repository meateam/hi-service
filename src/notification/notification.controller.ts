import NotificationService from "./notification.service";
import { IPermission } from "../utils/permission.inteface";

export default class NotificationController {
    static async notify(permission: IPermission) {
        return NotificationService.sendSharedFileNotification(permission.Creator, permission.UserID);
    }
}
