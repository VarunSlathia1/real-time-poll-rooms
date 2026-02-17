'use strict';

// Device Fingerprinting
class DeviceFingerprint {
    constructor(userAgent, screenResolution, timezone) {
        this.userAgent = userAgent;
        this.screenResolution = screenResolution;
        this.timezone = timezone;
    }

    getFingerprint() {
        return `${this.userAgent}-${this.screenResolution}-${this.timezone}`;
    }
}

// IP Reputation Tracking
class IPReputation {
    constructor() {
        this.reputationDatabase = {};
    }

    trackIP(ip, reputationScore) {
        this.reputationDatabase[ip] = reputationScore;
    }

    getReputation(ip) {
        return this.reputationDatabase[ip] || 'unknown';
    }
}

// Example usage
const device = new DeviceFingerprint(navigator.userAgent, window.screen.width + 'x' + window.screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('Device Fingerprint:', device.getFingerprint());

const ipReputation = new IPReputation();
ipReputation.trackIP('192.168.1.1', 'high');
console.log('IP Reputation:', ipReputation.getReputation('192.168.1.1'));
