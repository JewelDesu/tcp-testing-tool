
import os from 'os';

export function getStaticData() {
    const hostName = os.userInfo().username;
    return {
        hostName,
    }
}

