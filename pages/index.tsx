import type { NextPage } from 'next'
import Head from 'next/head'
import { Octokit } from '@octokit/core'

type Buidler = {
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

type Result<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: { message: string }
    }

type RepoContributor = {
  login: string
  id: number
  url: string
  contributions: number
}

type User = {
  login: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
}

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN || '' })

const REPOS = [
  // chains
  'bitcoin/bitcoin',
  'ethereum/go-ethereum',
  'ethereum/solidity',
  'solana-labs/solana',
  'terra-money/core',
  'bnb-chain/bsc',
  'ava-labs/avalanchego',
  'maticnetwork/bor',
  'near/nearcore',
  // defi
  'smartcontractkit/chainlink',
  'Uniswap/v2-core',
  'Uniswap/v3-core',
  'aave/protocol-v2',
  'aave/aave-v3-core',
  'curvefi/curve-contract',
  'OlympusDAO/olympus-contracts',
  // devtools
  'NomicFoundation/hardhat',
  'foundry-rs/foundry',
  'ChainSafe/web3.js',
  'ethers-io/ethers.js',
  'OpenZeppelin/openzeppelin-contracts',
  // wallet
  'MetaMask/metamask-extension',
  // infra
  'graphprotocol/graph-node',
  'streamingfast/substreams',
  'ceramicnetwork/ceramic',
  'ArweaveTeam/arweave',
  'ipfs/go-ipfs',
]

const Home: NextPage<{
  buidlers: Buidler[]
}> = ({ buidlers }) => {
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
                <User key={buidler.id} user={buidler} />
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

function User(props: { user: Buidler }) {
  return (
    <div className="flex rounded-lg border border-gray-200 shadow-md">
      <div className="flex-1 bg-orange-100">
        <div>
          <span className="underline">
            <a href={`https://github.com/${props.user.login}`}>
              {props.user.login}
            </a>
          </span>
          {props.user.name && <span>({props.user.name})</span>}
        </div>
        {/* <div>{props.user.bio}</div>
        <div>
          <span>{props.user.company}</span>
        </div> */}
        <div>
          {props.user.twitter_username && (
            <span className="underline">
              <a href={`https://twitter.com/${props.user.twitter_username}`}>
                @{props.user.twitter_username}
              </a>
            </span>
          )}
          {props.user.email && (
            <span className="underline">
              <a href={`mailto:${props.user.email}`}>email</a>
            </span>
          )}
          {props.user.blog && (
            <span className="underline">
              <a href={props.user.blog}>blog</a>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-green-100">
        {props.user.contributions} contributions to {props.user.repo}
      </div>
    </div>
  )
}

export async function getStaticProps() {
  // const res = await fetch(`http://${process.env.VERCEL_URL}:3000/api/hello`)
  // const { data: buidlers } = await res.json()
  // return {
  //   props: {
  //     buidlers,
  //   },
  // }
  const tryUsers = await Promise.all(REPOS.map((repo) => fetch(repo)))
  let users: Buidler[] = []
  for (const tryUser of tryUsers) {
    if (tryUser.error) {
      continue
    } else {
      users.push(...tryUser.data)
    }
  }

  return {
    props: {
      buidlers: users,
    },
  }
}

async function fetch(repo: string): Promise<Result<Buidler[]>> {
  try {
    const tryRepoContributors = await fetchRepoContributors(repo)
    if (tryRepoContributors.error) {
      return { error: tryRepoContributors.error }
    }
    const tryUsers = await Promise.all(
      tryRepoContributors.data.map((contributor) =>
        fetchUser(contributor.login)
      )
    )
    let result: Buidler[] = []
    for (let i = 0; i < tryUsers.length; i++) {
      const tryUser = tryUsers[i]
      if (tryUser.error) {
        return { error: tryUser.error }
      }
      const contributor = tryRepoContributors.data[i]
      const user = tryUser.data
      const buidler: Buidler = {
        login: contributor.login,
        id: contributor.id,
        url: contributor.url,
        repo: repo,
        contributions: contributor.contributions,
        name: user.name,
        company: user.company,
        blog: user.blog,
        email: user.email,
        bio: user.bio,
        twitter_username: user.twitter_username,
      }
      result.push(buidler)
    }
    return { data: result }
  } catch (error: any) {
    return { error: { message: error.message } }
  }
}

async function fetchRepoContributors(
  repo: string
): Promise<Result<RepoContributor[]>> {
  const [owner, repoName] = repo.split('/')
  try {
    const repoContributorsResp = await octokit.request(
      'GET /repos/{owner}/{repo}/contributors',
      {
        owner,
        repo: repoName,
      }
    )
    const repoContributors = repoContributorsResp.data as RepoContributor[]
    return { data: repoContributors }
  } catch (error: any) {
    console.log('fetchRepoContributors: ', error)
    return { error: { message: error.message } }
  }
}

async function fetchUser(username: string): Promise<Result<User>> {
  try {
    const userResp = await octokit.request('GET /users/{username}', {
      username,
    })
    const user = userResp.data as User
    return { data: { ...user } }
  } catch (error: any) {
    console.log('fetchUser: ', error)
    return { error: { message: error.message } }
  }
}

export default Home
