import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const SignUpPage = () => {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
          className="mx-auto h-10 w-auto"
          width={200}
          height={40}
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] p-10 rounded-2xl ">
        <form action="#" method="POST" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-100"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-100"
              >
                Password
              </label>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="cursor-pointer flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
        <div>
          <div className="flex mt-10 gap-x-6 items-center">
            <div className="flex-1 border-b border-gray-500"></div>
            <p className="text-nowrap font-semibold text-sm">
              Or continue with
            </p>
            <div className="flex-1 border-b border-gray-500"></div>
          </div>
          <div className="flex gap-4 pt-6">
            <button className="px-2 py-2.5 flex gap-3 flex-1 bg-gray-700 justify-center rounded-lg shadow items-center cursor-pointer hover:bg-gray-600 transition-colors">
              <Image
                alt="google logo"
                src="/google.svg"
                width={20}
                height={20}
              />
              <span className="text-sm font-semibold">Google</span>
            </button>
            <button className="px-2 py-2.5 flex gap-3 flex-1 bg-gray-700 justify-center rounded-lg shadow items-center cursor-pointer hover:bg-gray-600 transition-colors">
              <Image
                alt="google logo"
                src="/github.svg"
                width={20}
                height={20}
              />
              <span className="text-sm font-semibold">Github</span>
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-sm/6 text-gray-400">
        Already have an account?{' '}
        <Link
          href={'/auth/signin'}
          className="font-semibold text-indigo-400 hover:text-indigo-300 un"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
