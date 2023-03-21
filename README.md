# 1. 프로젝트 소개
+ **프로젝트 명** : 블록체인 기반 중고거래 플랫폼 개발

+ **프로젝트 소개**

  이더리움 블록체인 플랫폼에서 제공하는 스마트 컨트랙트는 중앙화 된 서버와 같은 제
3자가 필요하지 않아 안전성, 정확성, 투명성이 보장되는 P2P 디지털 계약이라는 장점을
가지고 있다. 위에서 설명한 것과 같이 실제 사용하면서 느꼈던 기존 플랫폼들의 단점들
을 개선한 중고거래 플랫폼 서비스를 웹으로 구현하고자 한다.
추가로 NFT가 낯선 이용자들이 중고거래라는 친숙한 플랫폼 내에서 자주 비치면서 친숙하게
만들고자 한다.

+ **프로젝트 목적**
  + 제 3자 중개인 없이 스마트 컨트랙트 이용한 에스크로 시스템
  + NFT가 낯선 일반 사용자들에게 그들만의 NFT 생성부터 거래까지 서비스 제공

# 2. 팀 소개
| 이름 | 이메일 |역할 |
| ------ | -- | ----------- |
| 서재화 | woghk6761@pusan.ac.kr | Backend</br> Frontend</br> 채팅, NFT관련 개발|
| 양민규 | tothedoor98@gmail.com | Backend</br> Frontend</br> 스마트컨트랙트 개발|
| 이정학 | rbsctst98@pusan.ac.kr | Backend</br> Frontend</br> DB구축 |

# 3. 구성도
<img src="https://user-images.githubusercontent.com/88009952/195762783-86411cd0-d261-4fd6-8457-f114ab6b1855.png">

+ **중고 거래 시스템 구성**
  + 이더리움 블록체인 네트워크를 활용한 투명한 거래 과정
  + 사용자 편의를 위한 SNS 로그인
  + 원할한 거래를 위한 채팅 및 후기 서비스
  + 거래 과정 및 택배 배송 과정 조회 기능
  
+ **NFT 거래 시스템 구성**
  + Metamask 지갑, ERC721, IPFS(데이터 공간 분산형 파일 시스템)을 활용한 NFT 거래 시스템

+ **Smart Contract**
  + Contract 비용을 줄이기 위해 User, 상품, 거래 내역 등 실제 Contract에서 거래가 이루어지는데 불필요한 정보는 DB에 저장
  
# 4. 시연 영상
[![스마트 컨트랙트 거래 과정](http://img.youtube.com/vi/HzyO5dhleUg/0.jpg)](https://youtu.be/HzyO5dhleUg?t=0s)

**NFT 거래 과정은 이더 테스트넷이 사용이 중지되어 사용 불가능.**
# 5. 사용법


1. git에서 파일 내려 받기
```
git clone
```

2. 각 폴더에서 package 내려 받기
```
npm install
```

3. Offchain-Backend 폴더에 .env 파일 생성
```
COOKIE_SECRET=
KAKAO_ID=
```

4. Frontend 폴더에 .env 파일 생성
```
REACT_APP_INFURA_PROJECT_ID=
REACT_APP_INFURA_PROJECT_SECRET=
REACT_APP_INFURA_PROJECT_GATEWAY=
REACT_APP_S3_BUKET_NAME= 
```

5. Offchain-Backend 폴더에 config 폴더 생성 후 config.json 파일 생성
```
{
    "development": {
      "username": "root",
      "password": "",
      "database": "offchainDB",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
}
```

6. 같은 폴더에 s3.json 파일 생성
```
{
    "accessKeyId": "",
    "secretAccessKey": "",
    "region": ""
}
```

7. db Schema 생성
```
sequelize db:create
```

8. Frontend, Offchain-Backend 폴더에서 각각 실행
```
npm start
```
```
nodemon start
```

