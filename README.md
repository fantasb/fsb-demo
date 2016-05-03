# fsb-demo
Idea Workspace



## Export SQL Data to CSV
Example: Companies
```
tmp=/tmp/sql.$(date +'%s').csv && echo "use fsb; select 'ID', 'Name', 'Rating' union all select id,display_name,ifnull(rating,'') from companies into outfile '$tmp' fields terminated by ',' enclosed by '\"' lines terminated by '\n'" | mysqlc && open -a/Applications/Microsoft\ Office\ 2011/Microsoft\ Excel.app "$tmp";
```



## Links
[Notes and Shiz](https://drive.google.com/drive/u/0/folders/0B7Vm5k81t538bHRmMjVvc2lNMnc)



