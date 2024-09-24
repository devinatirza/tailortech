package database

import (
	"fmt"
	"net"
)

var ip string

func getLocalIP() (string, error) {
    addrs, err := net.InterfaceAddrs()
    if err != nil {
        return "", err
    }

    for _, addr := range addrs {
        if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
            if ipnet.IP.To4() != nil {
                return ipnet.IP.String(), nil
            }
        }
    }
    return "", fmt.Errorf("cannot find local IP address")
}

func GetIP() string{
	if ip == "" {
		ip, _ = getLocalIP()
	}
	return ip
}