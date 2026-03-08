# Supabase 설정

## profiles 테이블 생성

상점(챌린저스 코인)과 프로필 표시 이름을 사용하려면 Supabase에 `profiles` 테이블이 필요합니다.

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택
2. 왼쪽 메뉴 **SQL Editor** 클릭
3. **New query** 로 새 쿼리 열기
4. 아래 `profiles.sql` 파일 내용을 복사해 붙여넣고 **Run** 실행

또는 터미널에서:

```bash
# profiles.sql 내용은 web/supabase/profiles.sql 참고
```

실행 후 `public.profiles` 테이블과 RLS 정책이 생성되며, 로그인한 사용자만 자신의 행을 읽고/쓰고/추가할 수 있습니다.
