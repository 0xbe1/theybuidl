import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

export type Buidler = {
  login: string
  id: number
  url: string
  repo: string
  contributions: number
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
}

type HomeProps = {
  buidlers: Buidler[]
}

const Home: NextPage<HomeProps> = ({ buidlers }) => {
  return (
    <div className="flex min-h-screen flex-col items-center font-mono">
      <Head>
        <title>buidler3</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <script
          data-token="VLESW6URT5L5"
          async
          src="https://cdn.splitbee.io/sb.js"
        ></script> */}
      </Head>

      <main className="flex w-full flex-1 items-center sm:w-4/5 lg:w-1/2">
        <div className="w-full">
          <div className=" text-center">
            <p className="bg-gradient-to-tr from-purple-600 to-blue-600 bg-clip-text text-6xl font-bold text-transparent">
              buidler3
            </p>
            <div>
              {buidlers.map((buidler) => (
                <p>{JSON.stringify(buidler)}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="flex h-16 w-full items-center justify-center border-t">
        By&nbsp;
        <a className="text-purple-600" href="https://github.com/0xbe1">
          @0xbe1
        </a>
        &nbsp;
        <a href="https://github.com/0xbe1/buidler3">
          <img src="github.svg" alt="GitHub" className="h-6" />
        </a>
        &nbsp;|&nbsp;Questions?&nbsp;
        <a href="https://discord.gg/u5KUjNZ8wy">
          <img src="discord.svg" alt="Discord" className="h-6" />
        </a>
        &nbsp;
        <a href="https://twitter.com/_0xbe1/status/1511638106554134530">
          <img src="twitter.svg" alt="Twitter" className="h-6" />
        </a>
        &nbsp;
        <a href="https://www.reddit.com/r/thegraph/comments/txi4c6/announcing_startblock_find_a_contracts_startblock/">
          <img src="reddit.svg" alt="Reddit" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  const res = await fetch('http://localhost:3000/api/hello')
  const { data: buidlers } = await res.json()
  return {
    props: {
      buidlers,
    },
  }
}

export default Home
