스크립트를 만들어둔 마이그레이션 시나리오는 **마이그레이션 실행 / 마이그레이션 되돌리기** 두가지입니다.

# 1. migration 실행

마이그레이션 파일을 생성하여 실행시키고 S3에 업로드합니다. S3 에 업로드하는 이유는 마이그레이션이 잘못되었을떄 되돌리려면 마이그레이션 파일이 필요하기 때문입니다. 

### STEP 1. 마이그레이션 파일 생성
```tsx

//test서버
yarn migration-generate:test

//운영서버
yarn migration-generate:production 
```
  - typeorm이 현재 코드베이스의 entity와 DB 스키마를 비교한다
  - DB 스키마 변동사항이 있다면 migration 파일을 생성한다
  - src/infrastructure/config/typeorm/migrations 에 생성됨

### STEP 2. 마이그레이션 실행 
```tsx
//test
yarn migration-run:test


//production
yarn migration-run:production
```
 - DB 스키마가 변경
- DB migration 테이블에 마이그레이션 파일 정보가 기록

### STEP3. S3에 마이그레이션 파일 업로드
```tsx
//test
yarn migration-upload:test


//production
yarn migration-upload:production
```
   - bucket: eum-migrations
   - 파일이 업로드되면 로컬에 마이그레이션파일 삭제됨
    

# 2. migration 되돌리기(revert)

만약 마이그레이션이 잘못되어 이전 버전으로 되돌리는 시나리오입니다.

*실행하기전에 DB에 마이그레이션 파일 이력과 S3에 업로드된 파일명을 비교해주세요!*

### STEP 1 가장 최근 업로드된 마이그레이션 파일을 S3에서 다운로드

```tsx
//test서버
yarn migration-download:test

//운영서버
yarn migration-download:production
```
    - bucket: eum-migrations
    - 환경(test/production) 별로 마이그레이션 파일이 따로 관리 되고있습니다

### STEP 2 마이그레이션 되돌리기 실행
```tsx
//test서버
yarn migration-revert:test

//운영서버
yarn migration-revert:production
```
    - DB스키마가 이전 버전으로 변경
    - DB migration 테이블에 되돌린 마이그레이션 이력이 삭제


> **마이그레이션 되돌리기 완료후 로컬에 다운로드 되어 있는 migration 파일과 S3에 있는 마이그레이션 더이상 필요없다면 삭제해주세요**
>