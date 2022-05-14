import type { NextPage } from 'next'
import Head from 'next/head'
import { Octokit } from '@octokit/core'
import { throttling } from '@octokit/plugin-throttling'

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

const ThrottledOctokit = Octokit.plugin(throttling)
const throttlingOptions = {
  auth: process.env.GITHUB_ACCESS_TOKEN || '',
  throttle: {
    onRateLimit: (
      retryAfter: number,
      options: Record<string, any>,
      octokit: Octokit
    ) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )

      if (options.request.retryCount === 0) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (
      retryAfter: number,
      options: Record<string, any>,
      octokit: Octokit
    ) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      )
    },
  },
}
const octokit = new ThrottledOctokit(throttlingOptions)

const REPOS = [
  // chains
  'bitcoin/bitcoin',
  'ethereum/go-ethereum',
  'ethereum/solidity',
  'solana-labs/solana',
  'terra-money/core',
  'near/nearcore',
  'paritytech/substrate',
  'paritytech/polkadot',
  'ava-labs/avalanchego',
  'cosmos/cosmos-sdk',
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
        <title>They Buidl</title>
        <link rel="icon" href="/favicon.ico" />
        {/* <script
          data-token="VLESW6URT5L5"
          async
          src="https://cdn.splitbee.io/sb.js"
        ></script> */}
      </Head>

      <main className="flex w-full flex-1 items-center sm:w-4/5 lg:w-1/2">
        <div className="w-full">
          <div className="">
            <p className="my-10 text-6xl font-bold text-purple-600">
              They Buidl
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
    <div className="flex rounded-lg border border-purple-600 my-2">
      <div className="flex-1 p-2">
        <div>
          <span>
            🐙{' '}
            <a
              className="underline"
              href={`https://github.com/${props.user.login}`}
            >
              {props.user.login}
            </a>
          </span>
          {props.user.name && <span>&nbsp;{props.user.name}</span>}
        </div>
        <div>
          {/* TODO: render github link when includes @ */}
          {props.user.company && <span>💻{' '}{props.user.company}</span>}
        </div>
        <div>
          {props.user.twitter_username && (
            <span>
              🐦{' '}
              <a
                className="underline"
                href={`https://twitter.com/${props.user.twitter_username}`}
              >
                @{props.user.twitter_username}
              </a>
            </span>
          )}
        </div>
        <div>
          {props.user.email && (
            <span>
              📮{' '}
              <a className="underline" href={`mailto:${props.user.email}`}>
                {props.user.email}
              </a>
            </span>
          )}
        </div>
        <div>
          {props.user.blog && (
            <span>
              🖊️{' '}
              <a className="underline" href={props.user.blog}>
                {props.user.blog}
              </a>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-2">
        {/* TODO: link to contributions */}
        {props.user.repo} ({props.user.contributions})
      </div>
    </div>
  )
}

export async function getStaticProps() {
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
