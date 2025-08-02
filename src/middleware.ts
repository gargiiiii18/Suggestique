
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from "next-auth/jwt"
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token = await getToken({req: request});
    const url = request.nextUrl;


    const isAuthPage = ['/signup', '/signin'].includes(url.pathname);

    //  console.log(isAuthPage);
    // console.log(token);
    

    if(token && isAuthPage){
        
    return NextResponse.redirect(new URL('/', request.url))
    }

    if(!token && !isAuthPage){
        return NextResponse.redirect(new URL('/signin', request.url))
    }


  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/signin',
    '/signup',
    '/recommend',
    '/checkout',
    '/'
  ]
}

