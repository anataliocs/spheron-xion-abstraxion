"use client";
import {useEffect, useState} from "react";
import {
    Abstraxion,
    useAbstraxionAccount,
    useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import {Button} from "@burnt-labs/ui";
import Link from "next/link";
import {Account} from "@cosmjs/stargate";
import {InstantiateResult} from "@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient";
import {upload} from "@spheron/browser-upload";

export default function Page(): JSX.Element {
    // Abstraxion hooks
    const {data: account} = useAbstraxionAccount();
    const {client} = useAbstraxionSigningClient();

    // General state hooks
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmittingTransaction, setSubmittingTransaction] = useState(false);

    const [accountInfo, setAccountInfo] = useState<Account | undefined>(undefined);

    // useState to store txResult
    const [txResults, setTxResults] = useState<InstantiateResult[]>([]);

    const getAccountInfo = async () => {
        if (client && account?.bech32Address) {
            const accountInfo = await client.getAccount(account?.bech32Address || "");
            setAccountInfo(accountInfo);
        } else {
            setAccountInfo(undefined);
        }
    };

    // useEffect to get the balance on load
    useEffect(() => {
        void getAccountInfo();
    }, [client]);

    const accountBlockExplorerUrl = `https://explorer.burnt.com/xion-testnet-1/account/${accountInfo?.address}`;

    const submitTransaction = async (): Promise<void> => {
        setSubmittingTransaction(true);
        try {
            if (!client) {
                setIsOpen(true);
                return;
            }
            const initMsg = {
                metadata: {
                    metadata: {
                        name: "name",
                        hub_url: "url",
                        description: "description",
                        tags: [],
                        social_links: [],
                        creator: account?.bech32Address,
                        thumbnail_image_url: "https://fakeimg.pl/200/",
                        banner_image_url: "https://fakeimg.pl/500/",
                    },
                },
                ownable: {
                    owner: account?.bech32Address,
                },
            };

            const txResult = await client.instantiate(
                account?.bech32Address || "",
                1,
                initMsg,
                "my-hub",
                {
                    amount: [{amount: "0", denom: "uxion"}],
                    gas: "500000",
                },
            );

            // get the temporary access token from the server
            const response = await
                fetch(`http://localhost:3001/uploadToken/test-bucket`);
            const resJson = await response.json();
            const token = resJson.uploadToken;
            console.log(token);

            let currentlyUploaded = 0;

            const jsonToStoreInIPFS = {
              transactionHash: txResult.transactionHash
            };

            const file: File = new File([JSON.stringify(jsonToStoreInIPFS)], 'transactionHash.json', {type: 'application/json'});
            const files: File[] = [file];

            const {uploadId, bucketId, protocolLink, dynamicLinks} =
                await upload(files, {
                    token,
                    onChunkUploaded: (uploadedSize, totalSize) => {
                        currentlyUploaded += uploadedSize;
                        console.log(`Uploaded ${currentlyUploaded} of ${totalSize} Bytes.`);
                    },
                });

            setTxResults([...txResults, txResult]);
        } catch (error) {
            // eslint-disable-next-line no-console -- No UI exists yet to display errors
            console.log(error);
        } finally {
            setSubmittingTransaction(false);
        }
    };


    return (
        <main className="m-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">
                ABSTRAXION
            </h1>
            <Button
                fullWidth
                onClick={() => {
                    setIsOpen(true);
                }}
                structure="base"
                theme="secondary"
            >
                {account ? (
                    <div className="flex items-center justify-center">VIEW ACCOUNT</div>
                ) : (
                    "CONNECT"
                )}
            </Button>
            <Abstraxion
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                }}
            />
            {client ? (
                <Button
                    disabled={isSubmittingTransaction}
                    fullWidth
                    onClick={() => {
                        void submitTransaction();
                    }}
                    structure="base"
                    theme="secondary"
                >
                    {isSubmittingTransaction ? "SUBMITTING..." : "SUBMIT TEST TRANSACTION"}
                </Button>
            ) : null}
            {accountInfo ? (
                <div className="flex flex-col rounded border-2 border-black p-2 dark:border-white">
                    <div className="mt-2">
                        <p className="text-zinc-500">
                            <span className="font-bold">Account Address:</span>
                        </p>
                        <p className="text-sm">{accountInfo.address}</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-zinc-500">
                            <span className="font-bold">Account Number:</span>
                        </p>
                        <p className="text-sm">{accountInfo?.accountNumber}</p>
                    </div>
                    <div className="mt-2">
                        <Link
                            className="text-black underline visited:text-purple-600 dark:text-white"
                            href={accountBlockExplorerUrl}
                            target="_blank"
                        >
                            View in Block Explorer
                        </Link>
                    </div>
                </div>
            ) : null}

            <div className="w-full space-y-4">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Transaction Results</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {txResults.map((txResult, index) => {
                        const transactionBlockExplorerUrl = `https://explorer.burnt.com/xion-testnet-1/tx/${txResult.transactionHash}`;

                        return (
                            <div
                                key={index}
                                className="flex flex-col rounded border-2 dark:border-white p-2 space-y-2 bg-white dark:bg-gray-800 shadow dark:shadow-white"
                            >
                                <div>
                                    <p className="font-bold dark:text-white">Transaction Hash:</p>
                                    <p className="text-sm overflow-ellipsis overflow-hidden dark:text-gray-300">{txResult.transactionHash}</p>
                                </div>
                                <div>
                                    <p className="font-bold dark:text-white">Block Height:</p>
                                    <p className="text-sm dark:text-gray-300">{txResult.height}</p>
                                </div>
                                <div>
                                    <Link
                                        className="text-black underline visited:text-purple-600 dark:text-white"
                                        href={transactionBlockExplorerUrl}
                                        target="_blank"
                                    >
                                        View in Block Explorer
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
