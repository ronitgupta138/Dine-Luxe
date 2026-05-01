"use client"

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import PageWrapper from '@/components/layout/PageWrapper'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { titleCase } from '@/lib/utils'

type RouteShellProps = {
	title?: string
	subtitle?: string
	statusLabel?: string
	children?: ReactNode
}

function makeTitle(pathname: string) {
	const parts = pathname.split('/').filter(Boolean)
	const clean = parts.filter((part) => !part.startsWith('['))
	const last = clean[clean.length - 1] || 'Overview'
	return titleCase(last)
}

function makeSubtitle(pathname: string) {
	const parts = pathname.split('/').filter(Boolean)
	if (parts.length <= 1) return 'Workspace'
	return titleCase(parts.slice(0, -1).join(' / '))
}

export default function RouteShell({ title, subtitle, statusLabel, children }: RouteShellProps) {
	const pathname = usePathname() || '/'
	const resolvedTitle = title || makeTitle(pathname)
	const resolvedSubtitle = subtitle || makeSubtitle(pathname)
	const isAuth = pathname.startsWith('/auth')

	if (isAuth) {
		return (
			<div className="space-y-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{resolvedSubtitle}</p>
					<h1 className="mt-3 font-display text-3xl text-ink">{resolvedTitle}</h1>
					<p className="mt-2 text-sm text-muted">
						This step is ready for details. Add your information to continue.
					</p>
				</div>
				<div className="rounded-3xl border border-ink/10 bg-paper/90 p-6 shadow-soft">
					<p className="text-sm text-muted">No form fields configured yet for this step.</p>
				</div>
			</div>
		)
	}

	return (
		<PageWrapper title={resolvedTitle} subtitle={resolvedSubtitle}>
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{children ? (
						children
					) : (
						<div className="rounded-3xl border border-ink/10 bg-paper/90 p-6 shadow-soft">
							<p className="text-sm text-muted">
								This view is staged for the full experience. Connect data sources to unlock real-time feeds.
							</p>
							<div className="mt-6 grid gap-3 md:grid-cols-2">
								{['Sync data', 'Assign roles', 'Launch service', 'Share with team'].map((item) => (
									<div key={item} className="rounded-2xl border border-ink/10 bg-surface p-4 text-sm font-semibold">
										{item}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
				<div className="space-y-4">
					<div className="rounded-3xl border border-ink/10 bg-paper/90 p-6 shadow-soft">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Status</p>
						<div className="mt-3">
							<StatusBadge status={statusLabel || 'Ready'} />
						</div>
						<p className="mt-4 text-sm text-muted">Last sync: 3 minutes ago</p>
					</div>
					<div className="rounded-3xl border border-ink/10 bg-paper/90 p-6 shadow-soft">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Next actions</p>
						<ul className="mt-4 space-y-2 text-sm text-ink">
							<li>Review today's goals</li>
							<li>Assign table blocks</li>
							<li>Confirm closing checklist</li>
						</ul>
					</div>
				</div>
			</div>
		</PageWrapper>
	)
}
