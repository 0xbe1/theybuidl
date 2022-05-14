import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import { fetchBuidlers } from './github'

const BOT_GITHUB_LOGINS = [
  'dependabot-preview[bot]',
  'dependabot[bot]',
  'renovate[bot]',
  'metamaskbot',
  'github-actions[bot]',
]

const MIN_CONTRIBUTIONS = 10

const GITHUB_REPOS = [
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

export type Result<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: { message: string }
    }

export type Buidler = {
  login: string
  id: number
  url: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  repo: string
  contributions: number
}

type AggBuidler = {
  login: string
  id: number
  url: string
  name: string
  company: string | null
  blog: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  // aggregate repo contributions on top of Buidler
  repoContributions: {
    repo: string
    contributions: number
  }[]
}

const Home: NextPage<{
  buidlers: AggBuidler[]
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
                <Buidler key={buidler.id} buidler={buidler} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="flex h-16 w-full items-center justify-center border-t">
        By&nbsp;
        <a className="text-purple-600" href="https://github.com/0xbe1">
          0xbe1
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
        <a href="https://twitter.com/_0xbe1">
          <img src="twitter.svg" alt="Twitter" className="h-6" />
        </a>
      </footer>
    </div>
  )
}

function Buidler(props: { buidler: AggBuidler }) {
  return (
    <div className="my-2 flex rounded-lg border border-purple-600">
      <div className="w-1/2 p-2">
        <DataRow
          icon={'🐙'}
          data={
            <>
              <a
                className="underline"
                href={`https://github.com/${props.buidler.login}`}
              >
                {props.buidler.login}
              </a>{' '}
              {props.buidler.name}
              {/* TODO: not add whitespace if no name */}
            </>
          }
        />

        {props.buidler.twitter_username && (
          <DataRow
            icon={'🐦'}
            data={
              <a
                className="underline"
                href={`https://twitter.com/${props.buidler.twitter_username}`}
              >
                {props.buidler.twitter_username}
              </a>
            }
          />
        )}

        {props.buidler.blog && (
          <DataRow
            icon={'📝'}
            data={
              <p className="overflow-hidden truncate">
                <a className="underline" href={props.buidler.blog}>
                  {props.buidler.blog}
                </a>
              </p>
            }
          />
        )}

        {props.buidler.email && (
          <DataRow
            icon={'📮'}
            data={
              <p className="overflow-hidden truncate">
                <a className="underline" href={`mailto:${props.buidler.email}`}>
                  {props.buidler.email}
                </a>
              </p>
            }
          />
        )}

        {props.buidler.company && (
          <DataRow
            icon={'💻'}
            data={<LinkifyText text={props.buidler.company} />}
          />
        )}

        {props.buidler.bio && (
          <DataRow
            icon={'👋'}
            data={<LinkifyText text={props.buidler.bio} />}
          />
        )}
      </div>

      <div className="w-1/2 p-2">
        {/* TODO: link to contributions */}
        {props.buidler.repoContributions.map((work, i) => (
          <div key={i}>
            {work.repo} ({work.contributions})
          </div>
        ))}
      </div>
    </div>
  )
}

function DataRow({ icon, data }: { icon: string; data: JSX.Element }) {
  return (
    <div className="flex">
      <div className="w-1/12">{icon}</div>
      <div className="w-11/12">{data}</div>
    </div>
  )
}

function LinkifyText({ text }: { text: string }) {
  return (
    <p>
      {text
        .split(' ')
        .map((word, i) => {
          if (word.startsWith('@')) {
            return (
              <a
                key={i}
                className="underline"
                href={`https://github.com/${word.substring(1)}`}
              >
                {word}
              </a>
            )
          } else {
            return <span key={i}>{word}</span>
          }
        })
        .reduce<React.ReactNode>((prev, curr) => [prev, ' ', curr], '')}
    </p>
  )
}

export async function getStaticProps() {
  const tryUsers = await Promise.all(
    GITHUB_REPOS.map((repo) => fetchBuidlers(repo))
  )
  let buidlers: Buidler[] = []
  for (const tryUser of tryUsers) {
    if (tryUser.error) {
      continue
    } else {
      buidlers.push(...tryUser.data)
    }
  }
  buidlers = buidlers.filter(shouldRender)

  const aggBuidlers = buidlers.reduce<AggBuidler[]>((acc, curr) => {
    const buidler = acc.find((buidler) => buidler.login === curr.login)
    if (buidler) {
      buidler.repoContributions.push({
        repo: curr.repo,
        contributions: curr.contributions,
      })
    } else {
      acc.push({
        login: curr.login,
        id: curr.id,
        url: curr.url,
        name: curr.name,
        company: curr.company,
        blog: curr.blog,
        email: curr.email,
        bio: curr.bio,
        twitter_username: curr.twitter_username,
        repoContributions: [
          {
            repo: curr.repo,
            contributions: curr.contributions,
          },
        ],
      })
    }
    return acc
  }, [])

  // order by contributions
  aggBuidlers.sort((a, b) => {
    return (
      b.repoContributions.reduce((acc, curr) => acc + curr.contributions, 0) -
      a.repoContributions.reduce((acc, curr) => acc + curr.contributions, 0)
    )
  })

  return {
    props: {
      buidlers: aggBuidlers,
    },
  }
}

function shouldRender(buidler: Buidler): boolean {
  if (BOT_GITHUB_LOGINS.includes(buidler.login)) {
    return false
  }
  if (buidler.contributions < MIN_CONTRIBUTIONS) {
    return false
  }
  return true
}

export default Home
