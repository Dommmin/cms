import Image from 'next/image';
import Link from 'next/link';

import { Linkedin, Twitter } from 'lucide-react';

import type { TeamMembersConfig, TeamMembersProps } from './team-members.types';

export function TeamMembersBlock({ block }: TeamMembersProps) {
  const cfg = block.configuration as TeamMembersConfig;
  const members = cfg.members ?? [];
  const columns = cfg.columns ?? 4;

  const colClass =
    {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-5',
    }[columns as 2 | 3 | 4 | 5] ?? 'grid-cols-2 sm:grid-cols-4';

  if (members.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="text-muted-foreground mt-2">{cfg.subtitle}</p>}
        </div>
      )}

      <div className={`grid gap-8 ${colClass}`}>
        {members.map((member, i) => (
          <div key={i} className="flex flex-col items-center gap-3 text-center">
            {member.photo_url ? (
              <Image
                src={member.photo_url}
                alt={member.name ?? ''}
                width={96}
                height={96}
                className="ring-border h-24 w-24 rounded-full object-cover ring-2"
              />
            ) : (
              <div className="bg-muted text-muted-foreground flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold">
                {member.name?.charAt(0) ?? '?'}
              </div>
            )}
            <div>
              {member.name && <p className="font-semibold">{member.name}</p>}
              {member.role && <p className="text-muted-foreground text-sm">{member.role}</p>}
            </div>
            {member.bio && <p className="text-muted-foreground text-sm">{member.bio}</p>}
            <div className="flex gap-3">
              {member.linkedin_url && (
                <Link
                  href={member.linkedin_url}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              )}
              {member.twitter_url && (
                <Link
                  href={member.twitter_url}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
