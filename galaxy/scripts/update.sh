#!/bin/bash
#curl --silent --location https://kerr1gan.github.io/galaxy/scripts/update.sh | bash
touch "/root/ssConfig.json"
cat>"/root/ssConfig.json"<<EOF
{
  "host": "127.0.0.1",
  "title": "CN-HK-S",
  "msg": "message"
}
EOF
