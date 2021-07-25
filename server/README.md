# Reddit clone coding

## 초기 세팅
typescript 


## Redis

Redis 메모리에 data를 저장 (C로 작성됨)
DB처럼 사용
RAM 처럼 in-memory방식으로 데이터에 접근하여 매우 빠른 실행속도를 보장받음
RAM은 휘발성 데이터에만 사용되어야함. ex) 회원, 로그인에서 세션을 디스크에 접근하면 느리고 <br>
redis는 RAM에서 사용하면 퍼포먼스에서 좋은 점도 있지만, 초기화가 되거나 없어져도 상관 없어서.
세션은 로그인되면 생성하고 로그아웃되면 파괴되면 되니까! 데이터 초기화 되도 가능한 부분에서만 활용 -> 삭제가 되면 안되는 데이터는 db에 담아야.. 

- redis는 도커 머신에서도 사용가능, 로컬에서도 가능. 윈도우에서 불가. 

- 용도
    - 사용자의 세션 서버
    - 웹페이지 캐싱(cache)

* 캐싱은 예로 nate.com에서 메인 페이지에 각각 API콜을 하는데 Select해서 보여질 데이터들을 redis에 
select로 적재하고 query 때리지 않고 메인 페이지를 보면 그 저장해 놓은 데이터를 뿌려주기만 하면 된다.

1번 서버 , 2번 서버 , 3번 서버가 
redis 세션서버를 둬서 세션간 공유가 될 수 있다.

설치하기
```
yarn add redis connect-redis express-session
```

- connect-redis
connect-redis는 redis session storage 의 express용을 제공합니다. 
(redis와 express-session 패키지도 같이 추가해줘야 함)


API 사용법
```
const redis = require('redis')
const session = require('express-session')

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient()

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: 'keyboard cat',
    resave: false,
  })
)
```


## 쿠키 세팅 후 graphql 설정
login이 성공되어도 isLogin에 대한 값이 false로 리턴.
GraphQL playground의 credention option이 설정되지 않아있다.
client의 session에 user정보가 담기지 않은 채 isLogin요청을해서 그러함.

localhost:4000/graphql에서 톱니바퀴 클릭하면 setting json을 확인할 수 있다.<br>

  "request.credentials": "omit" 를  <br>
  "request.credentials": "include" 로 변경


## Redis를 사용해보자!

- resolvers > user.ts 에서 

1. req.session.userId = user.id 라는 코드를 보면 유저 아이디를 session에 저장

{userId : 1}  [설명] send that to redis

2. 
session : qweoiasdfzxcv --> { userId : 1} [설명] express-session는 내 브라우저에 qweoiasdfzxcv value의 쿠키 값을 저장할 것이다.


3. 유저가 request를 날릴때 
qweoiasdfzxcv 를 server로 보냄

4. cookie를 해독
qweoiasdfzxcv -> session : qweoalsk

5. redis에게 보댈 request 생성
session : qweoalsk -> { userId : 1 }


6. req.session = { userId : 1 }
