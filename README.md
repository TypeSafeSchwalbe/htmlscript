# HTMLScript

```html
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Fibonacci</title>
        <script src="htmlscript.js"></script>
    </head>
    <body>
        <program>
            <set name="log"><js exec="console.log"></js></set>
            <set name="n"><number val="0"></number></set>
            <set name="a"><number val="0"></number></set>
            <set name="b"><number val="1"></number></set>
            <loop>
                <if>
                    <gteq><get name="n"></get><number val="20"></number></gteq>
                    <break></break>
                </if>
                <set name="n"><add><get name="n"></get><number val="1"></number></add></set>
                <set name="c"><add><get name="a"></get><get name="b"></get></add></set>
                <call><get name="log"></get><get name="c"></get></call>
                <set name="a"><get name="b"></get></set>
                <set name="b"><get name="c"></get></set>
            </loop>
        </program>
    </body>
</html>
```
```
1
2
3
5
8
13
21
34
55
89
144
233
377
610
987
1597
2584
4181
6765
10946
```