#!/bin/bash

cd "$(dirname "$0")"



# BEGIN parse config
mysqlHost=`cat ./algo/config.local.json | grep \"host\" | head -n1 | sed 's/.*host": "\(.*\)",/\1/'`
mysqlUser=`cat ./algo/config.local.json | grep \"user\" | head -n1 | sed 's/.*user": "\(.*\)",/\1/'`
mysqlPass=`cat ./algo/config.local.json | grep \"pass\" | head -n1 | sed 's/.*pass": "\(.*\)",/\1/'`
if [ ! "$mysqlHost" ]; then
	mysqlHost=`cat ./algo/config.json | grep \"host\" | head -n1 | sed 's/.*host": "\(.*\)",/\1/'`
	mysqlUser=`cat ./algo/config.json | grep \"user\" | head -n1 | sed 's/.*user": "\(.*\)",/\1/'`
	mysqlPass=`cat ./algo/config.json | grep \"pass\" | head -n1 | sed 's/.*pass": "\(.*\)",/\1/'`
fi
sqlCreds="-h$mysqlHost -u$mysqlUser"
if [ "$mysqlPass" ]; then sqlCreds="$sqlCreds -p'$mysqlPass'"; fi
# END parse config



(echo "drop database if exists fsb;" && cat ./workspace/database_init.sql && echo "use fsb;" && cat ./workspace/algo_schema.sql && cat ./workspace/algo_base_data.sql) | mysql $sqlCreds

node ./algo/bin/import.misc_company_facts.js --factName=builtinla_top_100_tech --factDisplay='BuiltInLA Top 100 Tech Companies' --factDescription='Featured in http://www.builtinla.com/2015/08/05/top-100-tech-companies-la' --sheetId=1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc --worksheet=1 --columnName='all'
node ./algo/bin/import.candidates.js --sheetId=1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc --worksheet=0

(echo "use fsb;" && cat ./workspace/algo_skill_fundamentals.sql) | mysql $sqlCreds

node ./algo/bin/score_candidates.js; node algo/bin/rank_role.js --role_id=1;

