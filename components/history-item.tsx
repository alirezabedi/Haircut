"use client";

import Image from "next/image";
import Link from "next/link";
import { formatWhen } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import type { SessionStatus } from "@/lib/fake-data";

const STATUS_LABEL: Record<SessionStatus, string> = {
  capturing: "In progress",
  processing: "In progress",
  ready: "Not approved",
  approved: "Approved",
  abandoned: "Not approved",
};

type Props = {
  href: string;
  name: string;
  thumbnail: string | null;
  createdAt: Date;
  status: SessionStatus;
  onNavigate?: () => void;
};

/** One row in the credits sheet's "Recent previews" list. */
export function HistoryItem({ href, name, thumbnail, createdAt, status, onNavigate }: Props) {
  const now = useNow();
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 border-b border-border py-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
    >
      <span className="relative size-14 flex-none overflow-hidden rounded-sm bg-muted">
        {thumbnail && (
          <Image src={thumbnail} alt="" fill sizes="56px" unoptimized className="object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="type-body truncate font-semibold">{name}</span>
        <span className="type-body-sm text-muted-foreground">
          {formatWhen(createdAt, now)} · {STATUS_LABEL[status]}
        </span>
      </span>
    </Link>
  );
}
