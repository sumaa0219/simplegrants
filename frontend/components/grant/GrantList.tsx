import React from "react";
import Image from "next/image";
import { GrantResponse } from "../../types/grant";
import FundingBar from "../FundingBar";
import { useGrantCartStore } from "../../utils/store";
import Button from "../Button";
import { useSession } from "next-auth/react";

interface IGrantListProps {
  grant: GrantResponse;
  onClick?: (e?: any) => any;
}

const GrantList = ({ grant, onClick }: IGrantListProps) => {
  const { grants, addToCart, removeFromCart } = useGrantCartStore();
  const { data: session } = useSession();
  console.log("session", session);

  const addedToCart = React.useMemo(
    () => grants.find((data) => data.id === grant.id),
    [grants, grant]
  );

  return (
    <div
      className="flex flex-col md:flex-row w-full bg-white shadow-card py-8 px-6 rounded-lg gap-x-6 cursor-pointer"
      key={grant.id}
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-lg aspect-[5/3] h-full max-w-xs w-full relative flex-none mb-4 md:mb-0">
        <Image
          src={grant.image}
          fill
          className="aspect-[5/3]"
          alt={grant.name}
        />
      </div>
      <div className="flex flex-col flex-grow w-full justify-between mb-4 md:mb-0">
        <div className="flex flex-col mb-4">
          <p className="font-bold text-xl">{grant?.name}</p>
          {grant.team && <p className="text-sg-700">by {grant.team[0].name}</p>}
          <p className="leading-relaxed line-clamp-3">{grant.description}</p>
        </div>
        <div className="flex flex-col">
          <FundingBar
            value={grant.amountRaised}
            max={grant.fundingGoal}
            className="mb-3"
          />
          <p className="font-bold text-lg">
            円enn{" "}
            {grant.amountRaised.toLocaleString("ja-JP", {
              maximumFractionDigits: 0,
            })}{" "}
            / {((grant.amountRaised / grant.fundingGoal) * 100).toFixed(0)}%
            funded
          </p>
        </div>
      </div>
      {addedToCart ? (
        <Button
          className="flex-none btn-error"
          onClick={(e) => {
            e.stopPropagation();
            removeFromCart(grant.id);
          }}
        >
          カートから削除 cart
        </Button>
      ) : (
        <Button
          className="flex-none md:w-max w-full"
          width="custom"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(grant);
          }}
          disabled={grant.team.some(
            (team) => team.email === session?.user?.email
          )}
        >
          カートに入れる
        </Button>
      )}
    </div>
  );
};

export default GrantList;
