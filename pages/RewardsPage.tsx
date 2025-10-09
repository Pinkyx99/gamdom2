import React from 'react';
import { RewardsHero } from '../components/rewards/RewardsHero';
import { ClaimableRewards } from '../components/rewards/ClaimableRewards';
import { RoyaltyUp } from '../components/rewards/RoyaltyUp';
import { RewardsInfo } from '../components/rewards/RewardsInfo';

const RewardsPage: React.FC = () => {
  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RewardsHero />
      <div className="my-8 md:my-12">
        <h2 className="text-3xl font-bold font-display text-white mb-6">Rewards</h2>
        <ClaimableRewards />
      </div>
       <div className="my-8 md:my-12">
        <RoyaltyUp />
      </div>
      <div className="my-8 md:my-12">
        <RewardsInfo />
      </div>
    </main>
  );
};

export default RewardsPage;