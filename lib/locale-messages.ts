import type { Region } from "./regions";

export type Lang = "en" | "de" | "fr" | "ja";

export type MessageKey =
  | "common.perMonth"
  | "common.cancel"
  | "common.save"
  | "common.saving"
  | "common.recording"
  | "common.processing"
  | "common.approve"
  | "common.reject"
  | "common.sending"
  | "common.ending"
  | "nav.registry"
  | "nav.field"
  | "nav.about"
  | "field.home.title"
  | "field.home.lede"
  | "field.home.explorerHeading"
  | "field.home.explorerBody"
  | "field.home.verifyHeading"
  | "field.home.verifyBody"
  | "field.home.verifyLink"
  | "field.home.registryNote"
  | "field.explorer.subNavLabel"
  | "field.explorer.tab.creatives"
  | "field.explorer.tab.organisations"
  | "field.explorer.tab.records"
  | "field.explorer.hub.title"
  | "field.explorer.creatives.headline"
  | "field.explorer.creatives.lede"
  | "field.explorer.creatives.searching"
  | "field.explorer.creatives.filtered"
  | "field.explorer.creatives.filter.search"
  | "field.explorer.creatives.filter.searchPlaceholder"
  | "field.explorer.creatives.filter.practice"
  | "field.explorer.creatives.filter.allPractices"
  | "field.explorer.creatives.filter.verification"
  | "field.explorer.creatives.filter.allCreatives"
  | "field.explorer.creatives.filter.verifiedOnly"
  | "field.explorer.creatives.filter.sort"
  | "field.explorer.creatives.filter.apply"
  | "field.explorer.creatives.sort.nameAsc"
  | "field.explorer.creatives.sort.nameDesc"
  | "field.explorer.creatives.sort.recent"
  | "field.explorer.creatives.empty.none"
  | "field.explorer.creatives.empty.filtered"
  | "field.explorer.creatives.empty.clearFilters"
  | "field.stub.preparing"
  | "field.stub.backHome"
  | "field.verify.title"
  | "field.verify.record.title"
  | "field.verify.hub.title"
  | "field.verify.hub.lede"
  | "field.verify.hub.lookupHeading"
  | "field.verify.hub.lookupIntro"
  | "field.verify.hub.lookupLabel"
  | "field.verify.hub.lookupPlaceholder"
  | "field.verify.hub.lookupSubmit"
  | "field.verify.hub.lookupHint"
  | "field.verify.hub.lookupRequired"
  | "field.verify.hub.hierarchyTitle"
  | "field.verify.hub.hierarchyIntro"
  | "field.verify.hub.tier1.label"
  | "field.verify.hub.tier1.body"
  | "field.verify.hub.tier2.label"
  | "field.verify.hub.tier2.body"
  | "field.verify.hub.tier3.label"
  | "field.verify.hub.tier3.body"
  | "field.verify.hub.section.verification.title"
  | "field.verify.hub.section.verification.body"
  | "field.verify.hub.section.provenance.title"
  | "field.verify.hub.section.provenance.body"
  | "field.verify.hub.section.registryRecord.title"
  | "field.verify.hub.section.registryRecord.body"
  | "field.verify.hub.section.howVerification.title"
  | "field.verify.hub.section.howVerification.body"
  | "field.verify.hub.section.certificates.title"
  | "field.verify.hub.section.certificates.body"
  | "field.verify.hub.linkRecords"
  | "field.explorer.creatives.filter.verifiedHint"
  | "field.presence.creative.title"
  | "field.presence.organisation.title"
  | "field.presence.collector.title"
  | "field.record.title"
  | "footer.field"
  | "nav.signIn"
  | "nav.takePart"
  | "nav.myAccount"
  | "nav.stewardship"
  | "nav.signOut"
  | "nav.account"
  | "nav.regionLabel"
  | "ecosystem.role.creative"
  | "ecosystem.role.organisation"
  | "ecosystem.role.collector"
  | "ecosystem.surface.studio"
  | "ecosystem.surface.field"
  | "ecosystem.surface.registry"
  | "ecosystem.workspace.studio"
  | "ecosystem.workspace.organisationStudio"
  | "getStarted.pathTooltip"
  | "account.hero.organisationIdentity"
  | "account.profile.organisationProfile"
  | "account.profile.publicProfileHint"
  | "footer.navigate"
  | "footer.access"
  | "footer.legal"
  | "footer.social"
  | "footer.registry"
  | "footer.about"
  | "footer.contact"
  | "footer.signIn"
  | "footer.register"
  | "footer.account"
  | "footer.privacy"
  | "footer.terms"
  | "footer.disclaimer"
  | "footer.instagram"
  | "footer.twitter"
  | "footer.tagline"
  | "footer.copyright"
  | "footer.regionLabel"
  | "footer.blurb"
  | "landing.hero.title"
  | "landing.hero.lede"
  | "landing.hero.browseCatalogue"
  | "landing.hero.takePart"
  | "landing.hero.overview"
  | "landing.cta.title"
  | "landing.cta.takePart"
  | "landing.cta.browseRegistry"
  | "landing.thesis.title"
  | "landing.thesis.card1Title"
  | "landing.thesis.card1Body"
  | "landing.thesis.card2Title"
  | "landing.thesis.card2Body"
  | "landing.thesis.card3Title"
  | "landing.thesis.card3Body"
  | "landing.flow.title"
  | "landing.flow.s1Label"
  | "landing.flow.s1Detail"
  | "landing.flow.s2Label"
  | "landing.flow.s2Detail"
  | "landing.flow.s3Label"
  | "landing.flow.s3Detail"
  | "landing.flow.s4Label"
  | "landing.flow.s4Detail"
  | "landing.workspace.title"
  | "landing.workspace.takePart"
  | "landing.workspace.viewPublic"
  | "landing.portfolio.title"
  | "getStarted.title"
  | "getStarted.alreadyAccount"
  | "getStarted.signIn"
  | "getStarted.roleNote"
  | "getStarted.artistTitle"
  | "getStarted.artistDesc"
  | "getStarted.artistCta"
  | "getStarted.galleryTitle"
  | "getStarted.galleryDesc"
  | "getStarted.galleryCta"
  | "getStarted.collectorTitle"
  | "getStarted.collectorDesc"
  | "getStarted.collectorCta"
  | "getStarted.catalogueTitle"
  | "auth.signIn"
  | "auth.resetPassword"
  | "auth.accessSubtitle"
  | "auth.createAccount"
  | "auth.resetSubtitle"
  | "auth.email"
  | "auth.password"
  | "auth.forgotPassword"
  | "auth.rememberMe"
  | "auth.signingIn"
  | "auth.sendReset"
  | "auth.sending"
  | "auth.backToSignIn"
  | "auth.needHelp"
  | "auth.getStarted"
  | "auth.artworkAuthHint"
  | "cookie.message"
  | "cookie.privacy"
  | "cookie.terms"
  | "cookie.accept"
  | "cookie.decline"
  | "contact.title"
  | "contact.lede"
  | "contact.note"
  | "registry.hero.headline"
  | "registry.hero.lede"
  | "registry.hero.trustNote"
  | "registry.hero.searching"
  | "registry.hero.clearSearch"
  | "archive.nav.personalArchive"
  | "archive.page.title"
  | "archive.page.lede"
  | "archive.action.archive"
  | "archive.action.archived"
  | "archive.action.remove"
  | "archive.count.one"
  | "archive.count.many"
  | "archive.footnote"
  | "archive.empty.title"
  | "archive.empty.body"
  | "archive.empty.cta"
  | "archive.loading"
  | "archive.error.generic"
  | "archive.error.session"
  | "archive.card.statusVerified"
  | "archive.card.statusRecorded"
  | "archive.card.noImage"
  | "archive.card.archivedOn"
  | "archive.card.currentRecord"
  | "archive.card.viewWork"
  | "registry.filters.search"
  | "registry.filters.searchPlaceholder"
  | "registry.filters.sort"
  | "registry.filters.sortNewest"
  | "registry.filters.sortOldest"
  | "registry.filters.sortTitleAsc"
  | "registry.filters.sortTitleDesc"
  | "registry.filters.status"
  | "registry.filters.allWorks"
  | "registry.filters.apply"
  | "registry.empty.label"
  | "registry.empty.title"
  | "registry.empty.noSearch"
  | "registry.empty.noRecords"
  | "registry.list.title"
  | "registry.list.page"
  | "registry.card.registryId"
  | "registry.card.noImage"
  | "registry.card.untitled"
  | "registry.card.added"
  | "registry.card.certStatus"
  | "registry.cert.verified"
  | "registry.cert.revoked"
  | "registry.card.viewRecord"
  | "registry.card.verifyCert"
  | "registry.card.viewCertLogin"
  | "registry.card.artworkPage"
  | "registry.pagination.showing"
  | "registry.pagination.previous"
  | "registry.pagination.next"
  | "registry.pagination.pageOf"
  | "about.hero.title"
  | "signup.joinTitle"
  | "signup.createArtistAccount"
  | "signup.subtitleArtworkAuth"
  | "signup.signingUpAs"
  | "signup.studioDesc"
  | "signup.alreadyRegistered"
  | "signup.otherEntryPaths"
  | "signup.workEmail"
  | "signup.confirmPassword"
  | "signup.passwordPlaceholder"
  | "signup.confirmPlaceholder"
  | "signup.creatingProfile"
  | "signup.createProfile"
  | "signup.checkEmail"
  | "signup.role.artist"
  | "signup.role.gallery"
  | "signup.role.collector"
  | "signup.err.inviteBlocked"
  | "signup.err.emailRequired"
  | "signup.err.passwordLength"
  | "signup.err.passwordMismatch"
  | "signup.invite.title"
  | "signup.invite.verifying"
  | "signup.invite.oneMoment"
  | "signup.invite.fetchError"
  | "signup.invite.expired"
  | "signup.invite.used"
  | "signup.invite.invalid"
  | "signup.invite.usedSubtitle"
  | "signup.invite.fallbackSubtitle"
  | "signup.invite.trustFooter"
  | "signup.invite.createArtistProfile"
  | "signup.invite.galleryInvited"
  | "signup.invite.directedTo"
  | "signup.invite.recordsTitle"
  | "signup.invite.noArtworks"
  | "signup.invite.joinMasked"
  | "signup.invite.joinGeneric"
  | "signup.invite.attestationNote"
  | "signup.invite.joinToAuthenticate"
  | "studio.nav.studio"
  | "studio.nav.records"
  | "studio.nav.artworks"
  | "studio.nav.certificates"
  | "studio.nav.ownership"
  | "studio.shell.activity"
  | "studio.shell.recentNotes"
  | "studio.shell.catalogueActivity"
  | "studio.shell.browseCatalogue"
  | "studio.shell.noActivity"
  | "registry.record.trust.revokedHeadline"
  | "registry.record.trust.revokedSub"
  | "registry.record.trust.verifiedHeadline"
  | "registry.record.trust.verifiedSubCert"
  | "registry.record.trust.verifiedSubNoCert"
  | "registry.record.trust.unverifiedHeadline"
  | "registry.record.trust.unverifiedSub"
  | "registry.record.verificationBy"
  | "registry.record.badge.certificate"
  | "registry.record.badge.noCertificate"
  | "registry.record.badge.locked"
  | "registry.record.aboutWork"
  | "registry.record.specifications"
  | "registry.record.field.medium"
  | "registry.record.field.dimensions"
  | "registry.record.field.year"
  | "registry.record.field.edition"
  | "registry.record.edition.unique"
  | "registry.record.edition.of"
  | "registry.record.edition.n"
  | "registry.record.edition.nOfT"
  | "registry.record.provenance"
  | "registry.record.recordInsights"
  | "registry.record.certStatusTitle"
  | "registry.record.certNotRecorded"
  | "registry.record.certRevoked"
  | "registry.record.certRecorded"
  | "registry.record.certFootnote"
  | "registry.record.verificationTitle"
  | "registry.record.registeredArtist"
  | "registry.record.heldBy"
  | "registry.record.ownership.verified"
  | "registry.record.ownership.claimed"
  | "registry.record.ownership.unassigned"
  | "registry.record.ownership.recorded"
  | "registry.record.heldByYou"
  | "registry.record.ownershipClaimed"
  | "registry.record.ownershipRecorded"
  | "registry.record.privateCollection"
  | "registry.record.share.copyLink"
  | "registry.record.share.copied"
  | "registry.record.share.prompt"
  | "registry.record.claim.checkingSession"
  | "registry.record.claim.signIn"
  | "registry.record.claim.button"
  | "registry.record.claim.title"
  | "registry.record.claim.request"
  | "registry.record.claim.recordId"
  | "registry.record.claim.artistReview"
  | "registry.record.claim.placeholder"
  | "registry.record.claim.submitting"
  | "registry.record.claim.submit"
  | "registry.record.claim.cancel"
  | "registry.record.claim.submitted"
  | "registry.record.claim.pending"
  | "registry.record.claim.error"
  | "registry.record.technical.title"
  | "registry.record.technical.verificationHash"
  | "registry.record.technical.timelineHash"
  | "about.principles.title"
  | "about.principles.p1Title"
  | "about.principles.p1Body"
  | "about.principles.p2Title"
  | "about.principles.p2Body"
  | "about.principles.p3Title"
  | "about.principles.p3Body"
  | "about.tabs.aria"
  | "about.tabs.sections"
  | "about.tabs.what"
  | "about.tabs.how"
  | "about.tabs.visibility"
  | "about.tabs.properties"
  | "about.tabs.who"
  | "about.what.title"
  | "about.what.p1"
  | "about.what.p2"
  | "about.what.p3"
  | "about.how.title"
  | "about.visibility.title"
  | "about.visibility.publicTitle"
  | "about.visibility.certsTitle"
  | "about.visibility.ownershipTitle"
  | "about.properties.title"
  | "about.properties.p1Title"
  | "about.properties.p1Body"
  | "about.properties.p2Title"
  | "about.properties.p2Body"
  | "about.properties.p3Title"
  | "about.properties.p3Body"
  | "about.audience.title"
  | "about.audience.artistsLabel"
  | "about.audience.artistsBody"
  | "about.audience.galleriesLabel"
  | "about.audience.galleriesBody"
  | "about.audience.collectorsLabel"
  | "about.audience.collectorsBody"
  | "pricing.eyebrow"
  | "pricing.title"
  | "pricing.pro.title"
  | "pricing.pro.f1"
  | "pricing.pro.f2"
  | "pricing.pro.f3"
  | "pricing.pro.f4"
  | "pricing.pro.f5"
  | "pricing.pro.continue"
  | "pricing.pro.nextStep"
  | "pricing.enterprise.title"
  | "pricing.enterprise.future"
  | "pricing.enterprise.f1"
  | "pricing.enterprise.f2"
  | "pricing.enterprise.f3"
  | "pricing.enterprise.f4"
  | "pricing.enterprise.f5"
  | "pricing.enterprise.note"
  | "pricing.enterprise.contact"
  | "pricing.alreadyAccount"
  | "gallery.nav.studio"
  | "gallery.nav.recordDepth"
  | "gallery.nav.roster"
  | "gallery.nav.catalogue"
  | "gallery.nav.verification"
  | "gallery.nav.invitations"
  | "gallery.shell.noCatalogueActivity"
  | "gallery.shell.loading"
  | "gallery.shell.dismiss"
  | "gallery.hero.tooltip"
  | "gallery.hero.institutionVerified"
  | "gallery.hero.verificationPending"
  | "gallery.hero.subscriptionGrace"
  | "gallery.hero.subscriptionActive"
  | "gallery.hero.subscriptionInactive"
  | "gallery.hero.subscriptionTrial"
  | "gallery.hero.registryAuthority"
  | "gallery.hero.openCatalogue"
  | "gallery.hero.work"
  | "gallery.hero.works"
  | "gallery.hero.inGalleryCatalogue"
  | "gallery.hero.singleRegistryIds"
  | "gallery.hero.institutionalVerification"
  | "gallery.hero.trustAndCerts"
  | "gallery.hero.worksVerified"
  | "gallery.hero.verifiedLine"
  | "gallery.hero.awaitingLine"
  | "gallery.hero.recordDepth"
  | "gallery.hero.mayDeepen"
  | "gallery.hero.institutionAttestation"
  | "gallery.hero.artistAttestationOnFile"
  | "gallery.hero.inviteOutstanding"
  | "gallery.hero.invitesOutstanding"
  | "gallery.hero.rosterAndInvites"
  | "gallery.hero.adminCanInvite"
  | "gallery.hero.institutionAttestationLine"
  | "gallery.hero.artistAttestationLine"
  | "gallery.hero.openAmendments"
  | "gallery.hero.amendmentsPending"
  | "gallery.hero.newInvitation"
  | "gallery.hero.registerWork"
  | "gallery.hero.inviteToAuthenticate"
  | "gallery.hero.aboutWorkspace"
  | "gallery.hero.publicPage"
  | "gallery.hero.account"
  | "gallery.hero.previewEmpty"
  | "gallery.intelligence.title"
  | "gallery.intelligence.syncing"
  | "gallery.intelligence.registrationPace"
  | "gallery.intelligence.worksRegistered"
  | "gallery.intelligence.addWorksTrend"
  | "gallery.intelligence.tapCatalogueDetail"
  | "gallery.intelligence.declaredValue"
  | "gallery.intelligence.noDeclaredValues"
  | "gallery.intelligence.multiCurrencyTap"
  | "gallery.intelligence.recordHealth"
  | "gallery.intelligence.gaps"
  | "gallery.intelligence.noData"
  | "gallery.intelligence.loadingBreakdown"
  | "gallery.intelligence.certificatesAndGaps"
  | "gallery.intelligence.ofCatalogueVerified"
  | "gallery.intelligence.recordsNotVerified"
  | "gallery.intelligence.galleryVerificationPending"
  | "gallery.intelligence.queueClear"
  | "gallery.intelligence.openVerification"
  | "gallery.summary.representedWorks"
  | "gallery.summary.verifiedSuffix"
  | "gallery.summary.noRecentActivity"
  | "gallery.empty.createProfile"
  | "gallery.empty.createProfileBody"
  | "gallery.empty.continueOnboarding"
  | "gallery.fallback.gallery"
  | "gallery.fallback.artist"
  | "gallery.fallback.untitled"
  | "gallery.recordDepth.empty"
  | "gallery.roster.tooltip"
  | "gallery.roster.noArtists"
  | "gallery.roster.noArtistsBody"
  | "gallery.roster.goToInvitations"
  | "gallery.roster.askAdmin"
  | "gallery.roster.viewPublicProfile"
  | "gallery.roster.noPublicProfile"
  | "gallery.roster.artist"
  | "gallery.roster.artists"
  | "gallery.representation.represented"
  | "gallery.representation.historical"
  | "gallery.representation.pending"
  | "gallery.catalogue.tooltip"
  | "gallery.catalogue.registerWork"
  | "gallery.catalogue.registeredWorks"
  | "gallery.catalogue.inCatalogue"
  | "gallery.catalogue.empty"
  | "gallery.catalogue.artistOnFile"
  | "gallery.catalogue.artistAttestationOnFile"
  | "gallery.catalogue.artistAttestationMayDeepen"
  | "gallery.catalogue.artistAttestationNotYetOnFile"
  | "gallery.catalogue.verified"
  | "gallery.catalogue.onFile"
  | "gallery.catalogue.invitationOnFile"
  | "gallery.catalogue.inviteArtistAuthenticate"
  | "gallery.verification.tooltip"
  | "gallery.verification.notVerifiedInstitution"
  | "gallery.verification.nothingAwaiting"
  | "gallery.verification.markVerified"
  | "gallery.guide.title"
  | "gallery.guide.body"
  | "gallery.readiness.tooltip"
  | "gallery.readiness.title"
  | "gallery.readiness.ready"
  | "gallery.readiness.needsAttention"
  | "gallery.readiness.incomplete"
  | "gallery.readiness.allPass"
  | "gallery.integrity.tooltip"
  | "gallery.integrity.title"
  | "gallery.integrity.complete"
  | "gallery.integrity.needsAttention"
  | "gallery.integrity.incomplete"
  | "gallery.integrity.allPass"
  | "gallery.priority.tooltip"
  | "gallery.priority.title"
  | "gallery.priority.immediate"
  | "gallery.priority.high"
  | "gallery.priority.standard"
  | "gallery.priority.low"
  | "gallery.participation.descIntro"
  | "gallery.participation.descMiddle"
  | "gallery.participation.descOutro"
  | "gallery.participation.title"
  | "gallery.participation.record"
  | "gallery.participation.records"
  | "gallery.participation.inviteAuthenticate"
  | "gallery.participation.untitledWork"
  | "gallery.participation.noImage"
  | "gallery.participation.associatedArtist"
  | "gallery.participation.institutionLayer"
  | "gallery.participation.publicRecord"
  | "gallery.status.ready"
  | "gallery.status.needsAttention"
  | "gallery.status.incomplete"
  | "gallery.status.complete"
  | "gallery.invitations.hubDesc"
  | "gallery.invitations.tabRepresentation"
  | "gallery.invitations.tabArtworkAuth"
  | "gallery.invitations.tabListLabel"
  | "gallery.invitations.sectionTooltip"
  | "gallery.invitations.sendRepresentationLabel"
  | "gallery.invitations.artistEmail"
  | "gallery.invitations.emailPlaceholder"
  | "gallery.invitations.sentAs"
  | "gallery.invitations.representationBody"
  | "gallery.invitations.duplicatePending"
  | "gallery.invitations.resend"
  | "gallery.invitations.adminOnly"
  | "gallery.invitations.noneSent"
  | "gallery.invitations.colArtist"
  | "gallery.invitations.colStatus"
  | "gallery.invitations.colSentDate"
  | "gallery.invitations.colActions"
  | "gallery.invitations.statusDeclined"
  | "gallery.invitations.copyInviteLink"
  | "gallery.invitations.copied"
  | "gallery.invitations.publishing"
  | "gallery.invitations.publish"
  | "gallery.invitations.manualDraftHint"
  | "gallery.invitations.copyDraft"
  | "gallery.invitations.representationSectionTitle"
  | "gallery.invitations.representationSectionDesc"
  | "gallery.artworkAuth.sectionTitle"
  | "gallery.artworkAuth.sectionDescIntro"
  | "gallery.artworkAuth.emptyBody"
  | "gallery.artworkAuth.sentPrefix"
  | "gallery.artworkAuth.resend"
  | "gallery.artworkAuth.copyLink"
  | "gallery.artworkAuth.statusAuthenticated"
  | "gallery.artworkAuth.statusWithdrawn"
  | "gallery.artworkAuth.statusExpired"
  | "gallery.artworkAuth.statusAwaiting"
  | "gallery.artworkAuth.modalTitle"
  | "gallery.artworkAuth.modalLead"
  | "gallery.artworkAuth.modalOutcome"
  | "gallery.artworkAuth.ctaSend"
  | "gallery.artworkAuth.artistOnFile"
  | "gallery.artworkAuth.institutionContinuityPending"
  | "gallery.artworkAuth.personalNote"
  | "gallery.artworkAuth.notePlaceholder"
  | "gallery.artworkAuth.adminOnlyError"
  | "gallery.artworkAuth.invalidEmail"
  | "gallery.artworkAuth.sendFailed"
  | "gallery.artworkAuth.networkError"
  | "gallery.artworkAuth.inviteOnFile"
  | "gallery.artworkAuth.inviteSent"
  | "gallery.artworkAuth.close"
  | "gallery.toast.loadMembershipFailed"
  | "gallery.toast.requestIncomplete"
  | "gallery.toast.inviteRecordAdminOnly"
  | "gallery.toast.inviteDuplicateOnFile"
  | "gallery.toast.inviteOnFileWithDetail"
  | "gallery.toast.inviteSentTo"
  | "gallery.toast.inviteRecordedNoEmail"
  | "gallery.toast.inviteResentSignupLink"
  | "gallery.toast.inviteLinkRefreshedNoEmail"
  | "gallery.toast.inviteVisibilityPublic"
  | "gallery.toast.couldNotPublish"
  | "gallery.toast.couldNotResend"
  | "gallery.toast.artworkAuthResent"
  | "gallery.toast.artworkAuthRefreshedNoEmail"
  | "gallery.toast.copyFailed"
  | "gallery.toast.imageRequired"
  | "gallery.toast.artistNameRequired"
  | "gallery.toast.registerFailedDetail"
  | "gallery.toast.profileAdminOnly"
  | "gallery.toast.profileSaveFailed"
  | "gallery.toast.verifyFailed"
  | "gallery.toast.verifySuccess"
  | "gallery.toast.certificateFailed"
  | "gallery.toast.certificateFiled"
  | "gallery.toast.certificateAlreadyOnFile"
  | "gallery.toast.certificateRetryFailed"
  | "gallery.toast.representationEndedFull"
  | "gallery.toast.latestActivity"
  | "gallery.toast.latestActivityWhen"
  | "gallery.toast.registerRequestFailed"
  | "gallery.artworkAuth.review.loading"
  | "gallery.artworkAuth.review.loadFailed"
  | "gallery.artworkAuth.review.missingLink"
  | "gallery.artworkAuth.review.loadFailedHint"
  | "gallery.artworkAuth.review.joinRegistry"
  | "gallery.artworkAuth.review.signIn"
  | "gallery.artworkAuth.review.joinPrompt"
  | "gallery.artworkAuth.review.authFailed"
  | "gallery.artworkAuth.review.wrongEmail"
  | "gallery.artworkAuth.review.notAuthorized"
  | "gallery.artworkAuth.review.contributeFailed"
  | "gallery.artworkAuth.review.withdrawn"
  | "gallery.artworkAuth.review.expired"
  | "gallery.artworkAuth.review.unavailable"
  | "gallery.artworkAuth.review.authenticatedTitle"
  | "gallery.artworkAuth.review.authenticatedBody"
  | "gallery.artworkAuth.review.viewPublicRecord"
  | "gallery.artworkAuth.review.contributeAuthorship"
  | "gallery.artworkAuth.review.artistStudio"
  | "gallery.artworkAuth.review.openPublicRecord"
  | "gallery.artworkAuth.review.openPublicRecordHint"
  | "gallery.artworkAuth.review.signInPrompt"
  | "gallery.artworkAuth.review.signInPromptGeneric"
  | "gallery.artworkAuth.review.joinToReview"
  | "gallery.artworkAuth.review.authenticateCta"
  | "gallery.artworkAuth.review.viewRecordFirst"
  | "gallery.artworkAuth.review.cardTooltip"
  | "gallery.artworkAuth.review.workOnFile"
  | "gallery.artworkAuth.review.institutionLabel"
  | "gallery.artworkAuth.review.artistLabel"
  | "gallery.artworkAuth.review.personalMessage"
  | "gallery.artworkAuth.review.joinPlatformPrompt"
  | "gallery.ops.reason.registryIdMissing"
  | "gallery.ops.reason.noArtistLinked"
  | "gallery.ops.reason.noOwnership"
  | "gallery.ops.reason.noOwnershipHistory"
  | "gallery.ops.reason.ownershipLedgerMismatch"
  | "gallery.ops.reason.titleMissing"
  | "gallery.ops.reason.metadataFingerprintMissing"
  | "gallery.ops.reason.missingDeclaredValue"
  | "gallery.ops.reason.missingImage"
  | "gallery.ops.reason.incompleteMetadata"
  | "gallery.ops.reason.certificateRevoked"
  | "gallery.ops.reason.missingVerification"
  | "gallery.ops.reason.noCertificateOnFile"
  | "gallery.ops.reason.listedWithoutVerification"
  | "gallery.ops.reason.listedWithoutCertificate"
  | "gallery.ops.reason.noDeclaredValueOnFile"
  | "gallery.ops.reason.highDeclaredValue"
  | "gallery.ops.reason.materialDeclaredValue"
  | "gallery.ops.reason.verifiedWithoutCertificate"
  | "gallery.ops.reason.noVerificationSignals"
  | "gallery.ops.reason.certifiedRecord"
  | "gallery.ops.reason.recentActivity"
  | "gallery.ops.reason.oldIncomplete"
  | "gallery.ops.reason.highValueNoCertificate"
  | "gallery.ops.action.assignArtist"
  | "gallery.ops.action.viewRecord"
  | "gallery.ops.action.completeDetails"
  | "gallery.ops.action.addValue"
  | "gallery.ops.action.verifyRecord"
  | "gallery.ops.action.issueCertificate"
  | "gallery.ops.recommended.noAction"
  | "gallery.ops.recommended.reviewRecord"
  | "gallery.api.invalidJson"
  | "gallery.api.invalidBody"
  | "gallery.api.unauthorized"
  | "gallery.api.missingGalleryId"
  | "gallery.api.invalidArtistEmail"
  | "gallery.api.inviteAdminOnly"
  | "gallery.api.resendAdminOnly"
  | "gallery.api.couldNotLoadGallery"
  | "gallery.api.galleryNotFound"
  | "gallery.api.couldNotVerifyInviteState"
  | "gallery.api.alreadyInvited"
  | "gallery.api.couldNotRecordInvite"
  | "gallery.api.missingInviteId"
  | "gallery.api.inviteNotFound"
  | "gallery.api.inviteNotPending"
  | "gallery.api.missingArtworkId"
  | "gallery.api.artworkNotFound"
  | "gallery.api.noInstitutionContext"
  | "gallery.api.emailCreatedFailed"
  | "gallery.api.emailUpdatedFailed"
  | "gallery.api.notAuthorisedInstitution"
  | "gallery.api.artworkAuthDuplicatePending"
  | "gallery.api.artworkAuthAlreadyCompleted"
  | "gallery.inviteDraft.subject"
  | "gallery.inviteDraft.to"
  | "gallery.inviteDraft.bodyIntro"
  | "gallery.inviteDraft.acceptLine1"
  | "gallery.inviteDraft.acceptLine2"
  | "gallery.inviteDraft.registrySignup"
  | "gallery.inviteDraft.galleryPage"
  | "gallery.inviteDraft.galleryPagePlaceholder"
  | "gallery.inviteDraft.afterOnboarding"
  | "gallery.email.artistInvite.subject"
  | "gallery.email.artistInvite.preheader"
  | "gallery.email.artistInvite.kicker"
  | "gallery.email.artistInvite.body1"
  | "gallery.email.artistInvite.body2"
  | "gallery.email.artistInvite.body3"
  | "gallery.email.artistInvite.cta"
  | "gallery.email.artistInvite.footnote"
  | "gallery.email.artistInvite.textIntro"
  | "gallery.email.artistInvite.textLink"
  | "gallery.email.artistInvite.textRegister"
  | "gallery.email.artistInvite.textDisregard"
  | "gallery.email.artworkAuth.subject"
  | "gallery.email.artworkAuth.preheader"
  | "gallery.email.artworkAuth.kicker"
  | "gallery.email.artworkAuth.body1"
  | "gallery.email.artworkAuth.body2"
  | "gallery.email.artworkAuth.body3"
  | "gallery.email.artworkAuth.noteFrom"
  | "gallery.email.artworkAuth.body4"
  | "gallery.email.artworkAuth.cta"
  | "gallery.email.artworkAuth.footnote"
  | "gallery.email.fallback.institution"
  | "gallery.email.fallback.artwork"
  | "gallery.email.fallback.gallery"
  | "representation.publicParticipationOnFile"
  | "representation.artistAttestationOnFile"
  | "representation.artistAttestationMayDeepen"
  | "collector.nav.workspace"
  | "collector.nav.works"
  | "collector.nav.attention"
  | "collector.shell.publicCollection"
  | "collector.shell.publicListingsNote"
  | "collector.shell.loading"
  | "collector.hero.fallbackCollection"
  | "collector.hero.tooltip"
  | "collector.hero.ownershipOnRecord"
  | "collector.hero.viewWorks"
  | "collector.hero.inStewardship"
  | "collector.hero.studioSince"
  | "collector.hero.work"
  | "collector.hero.works"
  | "collector.hero.verifiedOwnership"
  | "collector.hero.privateByDefault"
  | "collector.hero.accountPresence"
  | "collector.hero.profile"
  | "collector.hero.on"
  | "collector.hero.off"
  | "collector.hero.publicPageAvailable"
  | "collector.hero.workspacePrivate"
  | "collector.hero.anonymousLabel"
  | "collector.hero.nameShown"
  | "collector.hero.continuity"
  | "collector.hero.openAttention"
  | "collector.hero.nothingNeedsAttention"
  | "collector.hero.item"
  | "collector.hero.items"
  | "collector.hero.attentionLabel"
  | "collector.hero.actionSuggested"
  | "collector.hero.allClear"
  | "collector.hero.publicCollection"
  | "collector.hero.publicPageWhenSlug"
  | "collector.hero.registry"
  | "collector.hero.previewEmpty"
  | "collector.hero.previewNoImages"
  | "collector.overview.srOnly"
  | "collector.overview.empty"
  | "collector.overview.held"
  | "collector.overview.verifiedOwnership"
  | "collector.overview.pendingTransfer"
  | "collector.overview.notVerified"
  | "collector.overview.openClaims"
  | "collector.overview.withCertificate"
  | "collector.word.work"
  | "collector.word.works"
  | "collector.word.record"
  | "collector.word.records"
  | "collector.word.transfer"
  | "collector.word.transfers"
  | "collector.word.claim"
  | "collector.word.claims"
  | "collector.works.title"
  | "collector.works.order"
  | "collector.works.sortRecency"
  | "collector.works.sortValue"
  | "collector.works.emptyPrefix"
  | "collector.works.emptyLink"
  | "collector.works.emptySuffix"
  | "collector.works.transferPending"
  | "collector.works.verificationOutstanding"
  | "collector.attention.title"
  | "collector.attention.empty"
  | "collector.attention.verificationPending"
  | "collector.attention.transferResolve"
  | "collector.attention.claimInProgress"
  | "collector.fallback.collector"
  | "collector.fallback.artist"
  | "collector.fallback.untitled"
  | "collector.fallback.work"
  | "collector.activity.emptyHold"
  | "collector.activity.loading"
  | "collector.activity.noEvents"
  | "collector.activity.saleTransferPending"
  | "collector.activity.valueRecorded"
  | "collector.activity.ownershipClaim"
  | "collector.activity.ownershipUpdate"
  | "collector.activity.verification"
  | "collector.activity.untitledWork"
  | "collector.activity.detail"
  | "collector.activity.detailWithStatus"
  | "provenance.empty"
  | "provenance.chronology"
  | "provenance.chronologyIntro"
  | "provenance.supportingMaterial"
  | "provenance.certificateOnFile"
  | "provenance.howFileReads"
  | "provenance.continuityMarkers"
  | "provenance.fullChronology"
  | "provenance.currentRecord"
  | "provenance.event.registration"
  | "provenance.event.institutional"
  | "provenance.event.artistConfirmation"
  | "provenance.event.confirmation"
  | "provenance.event.certificate"
  | "provenance.event.custody"
  | "provenance.event.continuationGeneric"
  | "provenance.event.continuationCategory"
  | "provenance.event.disputeOpen"
  | "provenance.event.supportingMaterial"
  | "provenance.event.disputeResolved"
  | "provenance.transfer.ownership"
  | "provenance.transfer.initial"
  | "provenance.transfer.update"
  | "provenance.transfer.event"
  | "provenance.category.privateTransfer"
  | "provenance.category.sale"
  | "provenance.category.gift"
  | "provenance.category.inheritance"
  | "provenance.category.continuation"
  | "provenance.participant.registeredArtist"
  | "provenance.participant.representedInstitution"
  | "provenance.participant.attributedArtist"
  | "provenance.participant.issuingAuthority"
  | "provenance.participant.independentReview"
  | "provenance.participant.attributedTo"
  | "provenance.participant.fromTo"
  | "provenance.verification.openingFacts"
  | "provenance.verification.participantConfirmation"
  | "provenance.verification.artistAttestation"
  | "provenance.verification.confirmation"
  | "provenance.verification.document"
  | "provenance.verification.participantConfirmed"
  | "provenance.verification.claim"
  | "provenance.verification.recorded"
  | "provenance.verification.reviewProcess"
  | "provenance.verification.appendedReview"
  | "provenance.verification.outcome"
  | "provenance.verification.outcomeDismissed"
  | "provenance.continuity.chainIntact"
  | "provenance.continuity.custodyMilestone"
  | "provenance.continuity.supportingMaterial"
  | "provenance.continuity.alignsWithCustody"
  | "provenance.continuity.continuedByParticipants"
  | "provenance.completeness.high"
  | "provenance.completeness.moderate"
  | "provenance.completeness.limited"
  | "provenance.completeness.highDesc"
  | "provenance.completeness.moderateDesc"
  | "provenance.completeness.limitedDesc"
  | "provenance.temporal.sinceYear"
  | "provenance.temporal.multipleChapters"
  | "provenance.temporal.spanYears"
  | "provenance.temporal.institutionContinuity"
  | "provenance.insight.noVerification"
  | "provenance.insight.ownershipUnverified"
  | "provenance.insight.saleIncomplete"
  | "provenance.insight.fullyVerified"
  | "provenance.insight.noRecentActivity"
  | "about.journey.recordTitle"
  | "about.journey.recordSubtitle"
  | "about.journey.verifyTitle"
  | "about.journey.verifySubtitle"
  | "about.journey.certifyTitle"
  | "about.journey.certifySubtitle"
  | "about.journey.traceTitle"
  | "about.journey.traceSubtitle"
  | "about.journey.then"
  | "studio.search.byTitle"
  | "studio.search.artworks"
  | "studio.search.certificates"
  | "studio.filter.artworks"
  | "studio.filter.certificates"
  | "studio.filter.ownership"
  | "studio.filter.verifiedOnly"
  | "studio.filter.notVerified"
  | "studio.filter.withDeclaredValue"
  | "studio.filter.noDeclaredValue"
  | "studio.registerArtwork"
  | "studio.artworks.noMatches"
  | "studio.artworks.verified"
  | "studio.artworks.notVerified"
  | "studio.artworks.verifiedTooltip"
  | "studio.artworks.recordValue"
  | "studio.artworks.noRecordId"
  | "studio.artworks.emptyLabel"
  | "studio.artworks.emptyTitle"
  | "studio.certificates.all"
  | "studio.certificates.withImage"
  | "studio.certificates.withoutImage"
  | "studio.certificates.noMatches"
  | "studio.certificates.imagePlaceholder"
  | "studio.certificates.registryCertificate"
  | "studio.certificates.open"
  | "studio.certificates.emptyLabel"
  | "studio.certificates.emptyTitle"
  | "studio.ownership.filterAll"
  | "studio.ownership.filterNeedsTransfer"
  | "studio.ownership.filterSold"
  | "studio.ownership.filterHeldByYou"
  | "studio.ownership.noMatches"
  | "studio.ownership.noTransfers"
  | "studio.ownership.transferLedger"
  | "studio.ownership.transferLedgerPlural"
  | "studio.ownership.you"
  | "studio.ownership.unassigned"
  | "studio.ownership.collectorId"
  | "studio.ownership.saleLogged"
  | "studio.ownership.lastEventSale"
  | "studio.ownership.inYourCustody"
  | "studio.ownership.currentHolder"
  | "studio.ownership.chainDepth"
  | "studio.ownership.transfersOnRecord"
  | "studio.ownership.transfersOnRecordPlural"
  | "studio.ownership.noRegistryId"
  | "studio.ownership.ledgerLink"
  | "studio.ownership.emptyLabel"
  | "studio.ownership.emptyTitle"
  | "studio.hero.fallbackArtist"
  | "studio.hero.catalogue"
  | "studio.hero.openArtworks"
  | "studio.hero.registeredInStudio"
  | "studio.hero.work"
  | "studio.hero.works"
  | "studio.hero.verifiedBadge"
  | "studio.hero.pricedBadge"
  | "studio.hero.recordsToDeepen"
  | "studio.hero.recordsToDeepenPlural"
  | "studio.hero.amendmentNeedsResponse"
  | "studio.hero.amendmentsNeedResponse"
  | "studio.hero.recordHealth"
  | "studio.hero.certificates"
  | "studio.hero.verified"
  | "studio.hero.priced"
  | "studio.hero.publicStudio"
  | "studio.hero.artistPage"
  | "studio.hero.notPublishedYet"
  | "studio.hero.viewPublicPage"
  | "studio.hero.setupPresence"
  | "studio.hero.ownershipLedger"
  | "studio.hero.previewEmpty"
  | "studio.loading.opening"
  | "studio.form.title"
  | "studio.form.titleRequired"
  | "studio.form.year"
  | "studio.form.medium"
  | "studio.form.dimensions"
  | "studio.form.description"
  | "studio.form.visibility"
  | "studio.form.image"
  | "studio.form.imageRequired"
  | "studio.form.initialAmount"
  | "studio.form.currency"
  | "studio.form.eventType"
  | "studio.form.visibilityPrivate"
  | "studio.form.visibilityGallery"
  | "studio.form.visibilityPublic"
  | "studio.form.visibilityCertificate"
  | "studio.form.eventInitial"
  | "studio.form.eventPrimarySale"
  | "studio.form.eventSecondarySale"
  | "studio.form.eventAppraisal"
  | "studio.form.eventInternalEstimate"
  | "studio.register.titleNew"
  | "studio.register.titleGallery"
  | "studio.register.issueCanonical"
  | "studio.register.artistName"
  | "studio.register.asCreditedPlaceholder"
  | "studio.register.plainTextHint"
  | "studio.register.artistEmailOptional"
  | "studio.register.emailInvitePlaceholder"
  | "studio.register.linkRosterOptional"
  | "studio.register.noAccountLink"
  | "studio.register.placeholderTitle"
  | "studio.register.placeholderYear"
  | "studio.register.placeholderMedium"
  | "studio.register.placeholderDimensions"
  | "studio.register.placeholderDescription"
  | "studio.register.placeholderAmount"
  | "studio.artworkDetail.valueHistory"
  | "studio.artworkDetail.noValueHistory"
  | "studio.valueEvent.title"
  | "studio.valueEvent.declaredAmount"
  | "studio.valueEvent.amountPlaceholder"
  | "studio.valueEvent.noteOptional"
  | "studio.valueEvent.notePlaceholder"
  | "studio.valueEvent.helpAmount"
  | "studio.valueEvent.helpCurrency"
  | "studio.valueEvent.helpEventTypes"
  | "studio.valueEvent.helpVisibility"
  | "studio.valueEvent.helpNotes"
  | "studio.overview.valueCoverage.title"
  | "studio.overview.valueCoverage.subtitle"
  | "studio.overview.totalValue"
  | "studio.overview.totalValueCurrency"
  | "studio.overview.noPricedWorks"
  | "studio.overview.avgValueCurrency"
  | "studio.overview.recordHealth"
  | "studio.overview.priced"
  | "studio.overview.pricedHint"
  | "studio.overview.verifiedHint"
  | "studio.overview.locked"
  | "studio.overview.lockedHint"
  | "studio.overview.ownershipRequests.title"
  | "studio.overview.ownershipRequests.subtitle"
  | "studio.overview.noPendingClaims"
  | "studio.overview.pendingReview"
  | "studio.overview.claimant"
  | "studio.overview.valueProgression.title"
  | "studio.overview.valueProgression.subtitle"
  | "studio.overview.avgChange"
  | "studio.overview.avgChangeHint"
  | "studio.overview.worksIncreased"
  | "studio.overview.decliningWorks"
  | "studio.overview.noProgressionData"
  | "studio.overview.valueChange"
  | "studio.overview.ownershipIntel.title"
  | "studio.overview.ownershipIntel.subtitle"
  | "studio.overview.totalTransfers"
  | "studio.overview.worksYouHold"
  | "studio.overview.avgHoldDays"
  | "studio.overview.catalogueHighlights.title"
  | "studio.overview.catalogueHighlights.subtitle"
  | "studio.overview.mostTransferred"
  | "studio.overview.mostTransferredHint"
  | "studio.overview.longestHeld"
  | "studio.overview.longestHeldHint"
  | "studio.overview.fastestAppreciating"
  | "studio.overview.fastestAppreciatingHint"
  | "studio.records.noAwaitingAttestation"
  | "studio.records.institutionalRelationship"
  | "studio.records.relationshipOnFile"
  | "studio.records.endOnFile"
  | "studio.records.linkedWith"
  | "studio.records.linkVisibleAfterEnding"
  | "representation.canonicalRecordOnFile"
  | "representation.recordDeepensOverTime"
  | "representation.institutionAttestationOnFile"
  | "representation.priorContributionsRemainVisible"
  | "representation.historicalInstitutionLayer"
  | "representation.inviteRecordExists"
  | "representation.notApprovalWorkflow"
  | "representation.representationOnFile"
  | "representation.priorFilingsRemainVisible"
  | "representation.amendmentPendingReview"
  | "studio.records.deepen.eyebrow"
  | "studio.records.deepen.title"
  | "studio.records.deepen.description"
  | "studio.records.deepen.badge"
  | "studio.records.deepen.badgePlural"
  | "studio.records.deepen.step1"
  | "studio.records.deepen.step2"
  | "studio.records.deepen.step3"
  | "studio.records.deepen.step4"
  | "studio.records.deepen.opened"
  | "studio.records.deepen.reviewAuthenticate"
  | "studio.records.deepen.publicRecord"
  | "studio.records.deepen.contributeAuthorship"
  | "studio.records.deepen.authenticateAuthorship"
  | "studio.records.deepen.institution"
  | "studio.amendments.eyebrow"
  | "studio.amendments.title"
  | "studio.amendments.description"
  | "studio.amendments.responseNeeded"
  | "studio.amendments.responsesNeeded"
  | "studio.amendments.newRequest"
  | "studio.amendments.empty"
  | "studio.amendments.workFallback"
  | "studio.amendments.institution"
  | "studio.amendments.representedArtist"
  | "studio.amendments.roleArtist"
  | "studio.amendments.roleInstitution"
  | "studio.amendments.initiated"
  | "studio.amendments.statusAccepted"
  | "studio.amendments.statusDeclined"
  | "studio.amendments.statusWithdrawn"
  | "studio.amendments.resolution"
  | "studio.amendments.viewPublicRecord"
  | "studio.amendments.responseNote"
  | "studio.amendments.responsePlaceholder"
  | "studio.amendments.acceptOnFile"
  | "studio.amendments.decline"
  | "studio.amendments.withdrawRequest"
  | "studio.amendments.modalTitle"
  | "studio.amendments.chooseWork"
  | "studio.amendments.noteRequired"
  | "studio.amendments.noteDescribe"
  | "studio.amendments.requestFailed"
  | "studio.amendments.submitRequest"
  | "studio.authorship.title"
  | "studio.authorship.workFallback"
  | "studio.authorship.statement"
  | "studio.authorship.statementPlaceholder"
  | "studio.authorship.chronology"
  | "studio.authorship.chronologyPlaceholder"
  | "studio.authorship.filing"
  | "studio.authorship.fileContribution"
  | "studio.endRepresentation.title"
  | "studio.endRepresentation.noteOptional"
  | "studio.endRepresentation.notePlaceholder"
  | "studio.endRepresentation.acknowledge"
  | "studio.toast.verificationRequestFailed"
  | "studio.toast.verificationRequestRecorded"
  | "studio.toast.sessionEnded"
  | "studio.toast.verificationIncomplete"
  | "studio.toast.custodyVerified"
  | "studio.toast.connectionInterrupted"
  | "studio.toast.contributionFailed"
  | "studio.toast.contributionFiled"
  | "studio.toast.contributionError"
  | "studio.toast.confirmFailed"
  | "studio.toast.confirmRecorded"
  | "studio.toast.confirmError"
  | "studio.toast.amendmentResolveFailed"
  | "studio.toast.amendmentAccepted"
  | "studio.toast.amendmentDeclined"
  | "studio.toast.amendmentResolveError"
  | "studio.toast.withdrawFailed"
  | "studio.toast.amendmentWithdrawn"
  | "studio.toast.withdrawError"
  | "studio.toast.endRepresentationFailed"
  | "studio.toast.representationEnded"
  | "studio.toast.endRepresentationError"
  | "studio.toast.amendmentRequestFiled"
  | "studio.toast.activityLogFailed"
  | "studio.toast.claimApproveFailed"
  | "studio.toast.custodyLedgerFailed"
  | "studio.toast.custodyRowUpdateFailed"
  | "studio.toast.custodyRowRecordFailed"
  | "studio.toast.claimRecorded"
  | "studio.toast.claimWithdrawFailed"
  | "studio.toast.claimWithdrawn"
  | "studio.toast.registerFailed"
  | "studio.toast.valueFilingFailed"
  | "studio.toast.valueEventRecorded"
  | "studio.toast.buyerUuidInvalid"
  | "studio.toast.buyerIdRequired"
  | "studio.toast.buyerNameRequired"
  | "studio.toast.recordingTransfer"
  | "studio.toast.transferFailed"
  | "studio.toast.transferOwnerUpdateFailed"
  | "studio.toast.transferContinued"
  | "studio.ledger.saleRecorded"
  | "studio.ledger.completeTransfer"
  | "studio.ledger.recordTransferDetails"
  | "studio.ledger.transferDetails"
  | "studio.ledger.sellerPrefilled"
  | "studio.ledger.sellerUserIdPlaceholder"
  | "studio.ledger.buyer"
  | "studio.ledger.externalBuyer"
  | "studio.ledger.existingUser"
  | "studio.ledger.buyerUserIdPlaceholder"
  | "studio.ledger.buyerNamePlaceholder"
  | "studio.ledger.buyerType.collector"
  | "studio.ledger.buyerType.gallery"
  | "studio.ledger.buyerType.institution"
  | "studio.ledger.buyerType.private"
  | "studio.ledger.buyerType.unknown"
  | "studio.ledger.externalBuyerNote"
  | "studio.ledger.saleType"
  | "studio.ledger.saleTypePrimary"
  | "studio.ledger.saleTypeSecondary"
  | "studio.ledger.dateOfSale"
  | "studio.ledger.notes"
  | "studio.ledger.notesPlaceholder"
  | "studio.ledger.saveTransfer"
  | "studio.ledger.title"
  | "studio.ledger.artworkFallback"
  | "studio.ledger.valueHistorySubtitle"
  | "studio.ledger.noValueEvents"
  | "studio.ledger.noAdditionalContext"
  | "studio.ledger.visibility"
  | "studio.ledger.ownershipHistory"
  | "studio.ledger.ownershipHistorySubtitle"
  | "studio.ledger.noOwnershipEvents"
  | "studio.ledger.currentOwner"
  | "studio.ledger.claimedByYou"
  | "studio.ledger.claimedByOther"
  | "studio.ledger.from"
  | "studio.ledger.requestVerification"
  | "studio.ledger.submitting"
  | "studio.ledger.verifyOwnership"
  | "studio.ledger.verifying"
  | "studio.ledger.integrityNotes"
  | "studio.ledger.integritySubtitle"
  | "studio.ledger.noIntegrityData"
  | "studio.ledger.integrityEventOn"
  | "studio.ledger.unknownOwner"
  | "studio.ledger.unknown"
  | "studio.ledger.status.verified"
  | "studio.ledger.status.claimed"
  | "studio.ledger.status.unassigned"
  | "studio.ledger.status.recorded"
  | "studio.ledger.valueType.sale"
  | "studio.ledger.valueType.auction"
  | "studio.ledger.transferType.transfer"
  | "studio.ledger.transferType.initial"
  | "studio.ledger.transferType.correction"
  | "studio.ledger.transferType.sale"
  | "studio.ledger.confirm.areYouSure"
  | "studio.ledger.confirm.working"
  | "studio.ledger.confirm.adminVerify.title"
  | "studio.ledger.confirm.adminVerify.body"
  | "studio.ledger.confirm.adminVerify.confirm"
  | "studio.ledger.confirm.requestVerification.title"
  | "studio.ledger.confirm.requestVerification.body"
  | "studio.ledger.confirm.requestVerification.confirm"
  | "studio.insight.fallbackTitle"
  | "studio.insight.loadingSeries"
  | "studio.insight.noSeriesData"
  | "studio.insight.howToRead"
  | "studio.insight.breakdownHeading"
  | "studio.insight.notesHeading"
  | "studio.insight.defaultValueLabel"
  | "studio.insight.loadFailed"
  | "studio.insight.title.worksArtist"
  | "studio.insight.title.worksGallery"
  | "studio.insight.title.health"
  | "studio.insight.title.valueArtist"
  | "studio.insight.title.valueGallery"
  | "studio.insight.line.worksArtist"
  | "studio.insight.line.worksGallery"
  | "studio.insight.breakdown.totalWorks"
  | "studio.insight.breakdown.uniqueWorks"
  | "studio.insight.breakdown.unique"
  | "studio.insight.breakdown.editionWorks"
  | "studio.insight.breakdown.editions"
  | "studio.insight.breakdown.mostActivePeriod"
  | "studio.insight.breakdown.peakPeriod"
  | "studio.insight.breakdown.fullyVerifiedStrict"
  | "studio.insight.breakdown.withCertificate"
  | "studio.insight.breakdown.missingVerification"
  | "studio.insight.breakdown.latestDeclared"
  | "studio.insight.bar.fullyVerified"
  | "studio.insight.bar.certified"
  | "studio.insight.bar.incomplete"
  | "studio.insight.note.healthNonAdditive"
  | "studio.insight.note.healthStrictArtist"
  | "studio.insight.note.healthStrictGallery"
  | "studio.insight.note.valueBasisArtist"
  | "studio.insight.note.valueBasisGallery"
  | "studio.insight.subtitle.artist.catalogueSteadyGrowth"
  | "studio.insight.subtitle.artist.clearOwnership"
  | "studio.insight.subtitle.artist.ownershipPending"
  | "studio.insight.subtitle.artist.continuityNeeded"
  | "studio.insight.subtitle.artist.valuesShifted"
  | "studio.insight.subtitle.artist.valuesSteady"
  | "studio.insight.subtitle.artist.multiCurrencyTracked"
  | "studio.insight.subtitle.artist.addValueEvent"
  | "studio.insight.subtitle.artist.value.noEvents12mo"
  | "studio.insight.subtitle.artist.value.multiCurrency"
  | "studio.insight.subtitle.artist.value.trendingUp"
  | "studio.insight.subtitle.artist.value.softened"
  | "studio.insight.subtitle.artist.value.steady"
  | "studio.insight.subtitle.gallery.registrySteady"
  | "studio.insight.subtitle.gallery.ownershipPending"
  | "studio.insight.subtitle.gallery.verificationSteady"
  | "studio.insight.subtitle.gallery.recordsPending"
  | "studio.insight.subtitle.gallery.value.noDeclared"
  | "studio.insight.subtitle.gallery.value.multiCurrency"
  | "studio.insight.subtitle.gallery.value.trendingUp"
  | "studio.insight.subtitle.gallery.value.softened"
  | "studio.insight.subtitle.gallery.value.steady"
  | "studio.insight.subtitle.collector.ownershipPending"
  | "studio.insight.subtitle.collector.ownershipEstablished"
  | "studio.insight.subtitle.collector.multiCurrency"
  | "studio.insight.subtitle.collector.consistentRecord"
  | "studio.insight.subtitle.collector.value.noEvents"
  | "studio.insight.subtitle.collector.value.multiCurrency"
  | "studio.insight.subtitle.collector.value.trendingUp"
  | "studio.insight.subtitle.collector.value.softened"
  | "studio.insight.subtitle.collector.value.steady"
  | "studio.activity.artworkRegistered"
  | "studio.activity.valueUpdated"
  | "studio.activity.ownershipConfirmed"
  | "studio.activity.ownershipClaimRejected"
  | "studio.activity.authInviteSent"
  | "studio.activity.authenticatedAuthorship"
  | "studio.activity.representationConfirmed"
  | "studio.activity.provenanceInitiated"
  | "studio.activity.provenanceAccepted"
  | "studio.activity.provenanceCompleted"
  | "studio.activity.galleryInviteSent"
  | "studio.activity.accountDeletionRequested"
  | "studio.activity.artworkVerified"
  | "studio.activity.certificateIssued"
  | "studio.activity.artistOnboarded"
  | "studio.activity.personalArchiveAdded"
  | "studio.activity.personalArchiveRemoved"
  | "studio.activity.collectorOwnershipDeclared"
  | "studio.activity.galleryInviteAccepted"
  | "studio.activity.unknown"
  | "registry.record.certificateOverview";

const EN: Record<MessageKey, string> = {
  "common.perMonth": "per month",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saving": "Saving…",
  "common.recording": "Recording…",
  "common.processing": "Processing…",
  "common.approve": "Approve",
  "common.reject": "Reject",
  "common.sending": "Sending…",
  "common.ending": "Ending…",
  "nav.registry": "Registry",
  "nav.field": "The Field",
  "nav.about": "About",
  "nav.signIn": "Sign in",
  "nav.takePart": "Take part",
  "nav.myAccount": "My account",
  "nav.stewardship": "Studio",
  "nav.signOut": "Sign out",
  "nav.account": "Account",
  "nav.regionLabel": "Region & language",
  "ecosystem.role.creative": "Creative",
  "ecosystem.role.organisation": "Organisation",
  "ecosystem.role.collector": "Collector",
  "ecosystem.surface.studio": "Studio",
  "ecosystem.surface.field": "The Field",
  "ecosystem.surface.registry": "Registry",
  "field.home.title": "Public discovery and presence",
  "field.home.lede":
    "The Field is where you browse Creatives, Organisations, and Registry records — read-only surfaces that reflect what participants choose to make public. Studio remains where identity and stewardship are edited.",
  "field.home.explorerHeading": "Explorer",
  "field.home.explorerBody":
    "Three index views — Creatives, Organisations, and Registry records — with filters and pagination. No recommendations or paid ranking.",
  "field.home.verifyHeading": "Verify",
  "field.home.verifyBody":
    "Check verification and certificate status for a Registry record by its Registry ID.",
  "field.home.verifyLink": "Open verify entry",
  "field.home.registryNote":
    "The Registry remains the system of record. The Field reads from it; Studio is where records and profiles are stewarded.",
  "field.explorer.subNavLabel": "Field explorer",
  "field.explorer.tab.creatives": "Creatives",
  "field.explorer.tab.organisations": "Organisations",
  "field.explorer.tab.records": "Records",
  "field.explorer.hub.title": "Explorer",
  "field.explorer.creatives.headline": "Discover Creatives",
  "field.explorer.creatives.lede":
    "Browse public Creative profiles on The Field — practice, verification on file, and registry footprint. Discovery only; not a marketplace or recruitment surface.",
  "field.explorer.creatives.searching": "searching",
  "field.explorer.creatives.filtered": "filters applied",
  "field.explorer.creatives.filter.search": "Search by name",
  "field.explorer.creatives.filter.searchPlaceholder": "Creative name…",
  "field.explorer.creatives.filter.practice": "Practice",
  "field.explorer.creatives.filter.allPractices": "All practices",
  "field.explorer.creatives.filter.verification": "Verification",
  "field.explorer.creatives.filter.allCreatives": "All Creatives",
  "field.explorer.creatives.filter.verifiedOnly": "Verified on file",
  "field.explorer.creatives.filter.verifiedHint":
    "Creatives with verified Registry records or artist confirmation on file.",
  "field.explorer.creatives.filter.sort": "Sort",
  "field.explorer.creatives.filter.apply": "Apply",
  "field.explorer.creatives.sort.nameAsc": "Name A–Z",
  "field.explorer.creatives.sort.nameDesc": "Name Z–A",
  "field.explorer.creatives.sort.recent": "Recently updated",
  "field.explorer.creatives.empty.none":
    "No public Creatives yet. Participants can enable a public profile in Studio.",
  "field.explorer.creatives.empty.filtered":
    "No Creatives match your search or filters. Try clearing filters or choosing a different practice.",
  "field.explorer.creatives.empty.clearFilters": "Clear filters",
  "field.stub.preparing":
    "This route is scaffolded for Phase 2A. Content and data will ship in the next PR1 steps.",
  "field.stub.backHome": "Back to The Field",
  "field.verify.title": "Verify",
  "field.verify.record.title": "Record verification",
  "field.verify.hub.title": "Verify a Registry record",
  "field.verify.hub.lede":
    "The Field shows trust from the Registry ledger — verification status, participation on file, and certificate state. The Field does not issue verification; it reads Registry truth.",
  "field.verify.hub.lookupHeading": "Check by Registry ID",
  "field.verify.hub.lookupIntro":
    "Enter the Registry ID printed on a record or certificate to view its public verification status.",
  "field.verify.hub.lookupLabel": "Registry ID",
  "field.verify.hub.lookupPlaceholder": "e.g. RROWM-…",
  "field.verify.hub.lookupSubmit": "Check status",
  "field.verify.hub.lookupHint":
    "Public status only. Full certificate documents require sign-in.",
  "field.verify.hub.lookupRequired": "Enter a Registry ID to continue.",
  "field.verify.hub.hierarchyTitle": "How trust is ordered",
  "field.verify.hub.hierarchyIntro":
    "When reading a Creative or record on The Field, interpret signals in this order. Registry-backed facts outrank profile narrative.",
  "field.verify.hub.tier1.label": "Tier 1 — Registry record",
  "field.verify.hub.tier1.body":
    "Registry ID, record verification status, and artist confirmation on the ledger.",
  "field.verify.hub.tier2.label": "Tier 2 — Organisation & verified works",
  "field.verify.hub.tier2.body":
    "Organisation verification badges and factual counts of verified works — not popularity scores.",
  "field.verify.hub.tier3.label": "Tier 3 — Certificate",
  "field.verify.hub.tier3.body":
    "Whether a certificate is recorded or revoked for a verified record. Certificate verification applies after record verification.",
  "field.verify.hub.section.verification.title": "What verification means",
  "field.verify.hub.section.verification.body":
    "Verification is the Registry’s attestation that a record has passed defined confirmation on file. It is ledger-backed — not a social endorsement or paid badge.",
  "field.verify.hub.section.provenance.title": "What provenance means",
  "field.verify.hub.section.provenance.body":
    "Provenance is the chronological continuity of a Registry record — authorship, institution filing, representation, and ownership events confirmed on file.",
  "field.verify.hub.section.registryRecord.title": "What Registry records are",
  "field.verify.hub.section.registryRecord.body":
    "A Registry record is the canonical continuity entry for a work. The Field is a public read surface; the Registry remains the system of record.",
  "field.verify.hub.section.howVerification.title": "How verification works",
  "field.verify.hub.section.howVerification.body":
    "Participants steward records in Studio. Confirmation events and verification status are written to the Registry. The Field displays that state read-only.",
  "field.verify.hub.section.certificates.title": "How certificates work",
  "field.verify.hub.section.certificates.body":
    "After a record is verified, a certificate may be recorded. Public verify shows certificate status; the full certificate document is available to signed-in participants only.",
  "field.verify.hub.linkRecords": "Browse Registry records",
  "field.presence.creative.title": "Creative profile",
  "field.presence.organisation.title": "Organisation profile",
  "field.presence.collector.title": "Collector profile",
  "field.record.title": "Registry record",
  "ecosystem.workspace.studio": "Studio",
  "ecosystem.workspace.organisationStudio": "Organisation Studio",
  "getStarted.pathTooltip":
    "Each path opens the right Studio workspace for your participant type. Underneath: one chronology per work, on file in the Registry.",
  "account.hero.organisationIdentity": "Organisation identity",
  "account.profile.organisationProfile": "Organisation profile",
  "account.profile.publicProfileHint":
    "Biography and links shown on your public profile.",
  "footer.navigate": "Navigate",
  "footer.access": "Access",
  "footer.legal": "Legal",
  "footer.social": "Social",
  "footer.registry": "Registry",
  "footer.field": "The Field",
  "footer.about": "About",
  "footer.contact": "Contact",
  "footer.signIn": "Sign in",
  "footer.register": "Register",
  "footer.account": "Account",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.disclaimer": "Disclaimer",
  "footer.instagram": "Instagram",
  "footer.twitter": "X (Twitter)",
  "footer.tagline": "Registry · documentation · institutional record",
  "footer.copyright": "All rights reserved.",
  "footer.regionLabel": "Region & language",
  "footer.blurb":
    "A cryptographically verifiable registry for contemporary art, protecting authorship and provenance.",
  "landing.hero.title": "Infrastructure for cultural memory",
  "landing.hero.lede":
    "A trusted provenance registry for contemporary cultural work, connecting authorship, ownership and historical record in a single evolving archive.",
  "landing.hero.browseCatalogue": "Browse public gallery",
  "landing.hero.takePart": "Take part",
  "landing.hero.overview": "Overview",
  "landing.cta.title": "Join a work's continuity",
  "landing.cta.takePart": "Take part →",
  "landing.cta.browseRegistry": "Browse registry",
  "landing.thesis.title": "Continuity belongs with the work, not scattered across files",
  "landing.thesis.card1Title": "Current record",
  "landing.thesis.card1Body":
    "One catalogue entry per work: the listing you verify against today.",
  "landing.thesis.card2Title": "Chronology on file",
  "landing.thesis.card2Body":
    "Milestones accumulate in order; later filings sit alongside earlier ones.",
  "landing.thesis.card3Title": "Participant roles",
  "landing.thesis.card3Body":
    "Institutional association and collector studio activity appear where participants file them.",
  "landing.flow.title": "One thread for the work, from first listing to what comes next",
  "landing.flow.s1Label": "Name the work",
  "landing.flow.s1Detail":
    "List it once. The piece gets a lasting identity that artists, galleries, and collectors can return to.",
  "landing.flow.s2Label": "Attach what matters",
  "landing.flow.s2Detail":
    "Certificates, gallery association, custody notes: everything lands on the same entry instead of scattered files.",
  "landing.flow.s3Label": "See the present clearly",
  "landing.flow.s3Detail":
    "What is public today is easy to read. What you keep private stays behind sign-in until you choose otherwise.",
  "landing.flow.s4Label": "Let the thread grow",
  "landing.flow.s4Detail":
    "Each sale, transfer, or exhibition adds another line to the same story, in order, as years pass.",
  "landing.workspace.title": "Where holdings stay on file",
  "landing.workspace.takePart": "Take part",
  "landing.workspace.viewPublic": "View public layer",
  "landing.portfolio.title": "Portfolio management across every role",
  "getStarted.title": "Choose how you take part",
  "getStarted.alreadyAccount": "Already have an account?",
  "getStarted.signIn": "Sign in",
  "getStarted.roleNote": "Your role follows your profile, not this page alone.",
  "getStarted.artistTitle": "I am a Creative",
  "getStarted.artistDesc":
    "Register works so your catalogue presence, chronology, and certificates stay on one Registry record.",
  "getStarted.artistCta": "Continue as Creative",
  "getStarted.galleryTitle": "I represent an Organisation",
  "getStarted.galleryDesc":
    "Verified Organisation workflows: participant confirmations and listings on file for represented Creatives.",
  "getStarted.galleryCta": "View plans and continue",
  "getStarted.collectorTitle": "I am a Collector",
  "getStarted.collectorDesc":
    "Browse the public catalogue, read the current record, and file custody when you hold a work.",
  "getStarted.collectorCta": "Continue as Collector",
  "getStarted.catalogueTitle": "On the catalogue",
  "auth.signIn": "Sign in",
  "auth.resetPassword": "Reset password",
  "auth.accessSubtitle": "Access your registry with email and password.",
  "auth.createAccount": "Create an account",
  "auth.resetSubtitle":
    "Enter the email associated with your account. We will send a secure link to choose a new password.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.forgotPassword": "Forgot password?",
  "auth.rememberMe": "Remember me",
  "auth.signingIn": "Signing in…",
  "auth.sendReset": "Send reset link",
  "auth.sending": "Sending…",
  "auth.backToSignIn": "Back to sign in",
  "auth.needHelp": "Need help?",
  "auth.getStarted": "Get started",
  "auth.artworkAuthHint":
    "Sign in to review and authenticate the artwork record on file.",
  "cookie.message":
    "We use cookies to maintain core functionality and improve the experience.",
  "cookie.privacy": "Privacy",
  "cookie.terms": "Terms",
  "cookie.accept": "Accept",
  "cookie.decline": "Decline",
  "contact.title": "Contact",
  "contact.lede": "For general enquiries, partnerships, or institutional matters.",
  "contact.note":
    "We read every message; response times depend on volume and nature of the request. For data export, account deletion, or other privacy rights you can action yourself, use My Account → Privacy & data.",
  "registry.hero.headline": "Browse verified records",
  "registry.hero.lede":
    "Explore artworks registered with RROWM. Open a record for the authoritative verification layer; use the artwork page for a curated presentation.",
  "registry.hero.trustNote":
    "Only verified works appear in this index. Certificate documents are not exposed on the public grid. Sign in to view a full certificate where available.",
  "registry.hero.searching": "Searching",
  "registry.hero.clearSearch": "Clear search",
  "archive.nav.personalArchive": "Personal Archive",
  "archive.page.title": "Personal Archive",
  "archive.page.lede":
    "Works you have chosen to keep within reach as their registry record continues to evolve.",
  "archive.action.archive": "Archive",
  "archive.action.archived": "Archived",
  "archive.action.remove": "Remove from archive",
  "archive.count.one": "Present in {count} personal archive",
  "archive.count.many": "Present in {count} personal archives",
  "archive.footnote":
    "This work appears in personal archives maintained by participants across the registry.",
  "archive.empty.title": "No works archived yet",
  "archive.empty.body":
    "Works placed into your personal archive remain easy to revisit as their record continues to evolve.",
  "archive.empty.cta": "Browse catalogue",
  "archive.loading": "Loading your archive…",
  "archive.error.generic": "This action could not be completed.",
  "archive.error.session": "Refresh the page and try again.",
  "archive.card.statusVerified": "Verified on file",
  "archive.card.statusRecorded": "Recorded on file",
  "archive.card.noImage": "No image on file",
  "archive.card.archivedOn": "Archived {date}",
  "archive.card.currentRecord": "Current record",
  "archive.card.viewWork": "View work",
  "registry.filters.search": "Search",
  "registry.filters.searchPlaceholder": "Title or registry ID",
  "registry.filters.sort": "Sort",
  "registry.filters.sortNewest": "Newest first",
  "registry.filters.sortOldest": "Oldest first",
  "registry.filters.sortTitleAsc": "Title A–Z",
  "registry.filters.sortTitleDesc": "Title Z–A",
  "registry.filters.status": "Status",
  "registry.filters.allWorks": "All works",
  "registry.filters.apply": "Apply",
  "registry.empty.label": "Registry",
  "registry.empty.title": "No records to show",
  "registry.empty.noSearch":
    "No verified artworks match your search. Try different keywords or clear the search.",
  "registry.empty.noRecords":
    "No verified artworks yet. Check back once records are published.",
  "registry.list.title": "Verified records",
  "registry.list.page": "Page {page}",
  "registry.card.registryId": "Registry ID",
  "registry.card.noImage": "No image on file",
  "registry.card.untitled": "Untitled",
  "registry.card.added": "Added",
  "registry.card.certStatus": "Certificate status:",
  "registry.cert.verified": "Verified",
  "registry.cert.revoked": "Revoked",
  "registry.card.viewRecord": "View registry record",
  "registry.card.verifyCert": "Verify certificate",
  "registry.card.viewCertLogin": "View certificate (login required)",
  "registry.card.artworkPage": "Artwork page",
  "registry.pagination.showing": "Showing {start}–{end} of {total}",
  "registry.pagination.previous": "Previous",
  "registry.pagination.next": "Next",
  "registry.pagination.pageOf": "Page {page} of {totalPages}",
  "about.hero.title":
    "A system for recording authorship, provenance, and verification",
  "signup.joinTitle": "Join the registry",
  "signup.createArtistAccount": "Create Creative account",
  "signup.subtitleArtworkAuth":
    "After setup you will return to review and authenticate the artwork record on file.",
  "signup.signingUpAs": "You're signing up as",
  "signup.studioDesc":
    "Your studio holds represented works, chronology actions, and the current record together.",
  "signup.alreadyRegistered": "Already registered?",
  "signup.otherEntryPaths": "Other entry paths",
  "signup.workEmail": "Work email",
  "signup.confirmPassword": "Confirm password",
  "signup.passwordPlaceholder": "At least 8 characters",
  "signup.confirmPlaceholder": "Re-enter password",
  "signup.creatingProfile": "Creating profile…",
  "signup.createProfile": "Create profile",
  "signup.checkEmail":
    "Check your email to confirm your address, then return here in this browser to finish setup.",
  "signup.role.artist": "Creative",
  "signup.role.gallery": "Organisation",
  "signup.role.collector": "Collector",
  "signup.err.inviteBlocked":
    "This invitation cannot be used to complete registration.",
  "signup.err.emailRequired": "Enter your email address.",
  "signup.err.passwordLength": "Password must be at least 8 characters.",
  "signup.err.passwordMismatch": "Passwords do not match.",
  "signup.invite.title": "Invitation",
  "signup.invite.verifying": "Verifying your invitation…",
  "signup.invite.oneMoment": "One moment.",
  "signup.invite.fetchError": "This invitation could not be verified",
  "signup.invite.expired": "This invitation has expired",
  "signup.invite.used": "This invitation has already been used",
  "signup.invite.invalid": "This invitation is not valid",
  "signup.invite.usedSubtitle":
    "If you already have an account, sign in below. Otherwise create a new account to get started.",
  "signup.invite.fallbackSubtitle":
    "You can still join the registry and manage your records. Create an account or sign in if you already have one.",
  "signup.invite.trustFooter":
    "This invitation was sent through the RROWM Registry. Your details are used only to establish your profile and what appears on file for represented works.",
  "signup.invite.createArtistProfile": "Create artist profile",
  "signup.invite.galleryInvited":
    "has invited you to authenticate records on file. After you create your profile, you'll review and deepen each record.",
  "signup.invite.directedTo":
    "This invitation is directed to {email}. Use that address when you register.",
  "signup.invite.recordsTitle": "Records associated with your practice",
  "signup.invite.noArtworks":
    "Records filed by {gallery} will appear in your studio once you join. You can review, authenticate authorship, and deepen each record.",
  "signup.invite.joinMasked":
    "Join the registry as {email} to authenticate authorship, add continuity, and deepen records on file.",
  "signup.invite.joinGeneric":
    "Join the registry to authenticate authorship, add continuity, and deepen records on file.",
  "signup.invite.attestationNote":
    "Layered attestations only, not ownership adjudication or institution approval.",
  "signup.invite.joinToAuthenticate": "Join to authenticate",
  "studio.nav.studio": "Studio",
  "studio.nav.records": "Records",
  "studio.nav.artworks": "Artworks",
  "studio.nav.certificates": "Certificates",
  "studio.nav.ownership": "Ownership",
  "studio.shell.activity": "Activity",
  "studio.shell.recentNotes": "Recent notes",
  "studio.shell.catalogueActivity": "Catalogue activity",
  "studio.shell.browseCatalogue": "Browse public gallery",
  "studio.shell.noActivity": "No recent activity yet.",
  "registry.record.trust.revokedHeadline": "Certificate revoked",
  "registry.record.trust.revokedSub": "This record is flagged. Do not treat as verified.",
  "registry.record.trust.verifiedHeadline": "Verified record",
  "registry.record.trust.verifiedSubCert":
    "Certificate on file. Full document available to authorised users.",
  "registry.record.trust.verifiedSubNoCert":
    "Recorded in the registry; no certificate issued yet.",
  "registry.record.trust.unverifiedHeadline": "Registry record",
  "registry.record.trust.unverifiedSub": "This work is registered but not yet verified.",
  "registry.record.verificationBy": "Verification recorded by {name}",
  "registry.record.badge.certificate": "Certificate",
  "registry.record.badge.noCertificate": "No certificate",
  "registry.record.badge.locked": "Locked",
  "registry.record.aboutWork": "About this work",
  "registry.record.specifications": "Specifications",
  "registry.record.field.medium": "Medium",
  "registry.record.field.dimensions": "Dimensions",
  "registry.record.field.year": "Year",
  "registry.record.field.edition": "Edition",
  "registry.record.edition.unique": "Unique work",
  "registry.record.edition.of": "Edition of {total}",
  "registry.record.edition.n": "Edition {n}",
  "registry.record.edition.nOfT": "Edition {n} of {total}",
  "registry.record.provenance": "Provenance",
  "registry.record.recordInsights": "Record insights",
  "registry.record.certStatusTitle": "Certificate status",
  "registry.record.certNotRecorded": "Certificate not recorded",
  "registry.record.certRevoked": "✕ Revoked",
  "registry.record.certRecorded": "✓ Certificate recorded",
  "registry.record.certFootnote":
    "Numbers and fingerprints are not shown here. Sign in to view the full certificate document.",
  "registry.record.verificationTitle": "Verification",
  "registry.record.registeredArtist": "Registered artist",
  "registry.record.heldBy": "Held by",
  "registry.record.ownership.verified": "Owned (verified)",
  "registry.record.ownership.claimed": "Ownership claimed",
  "registry.record.ownership.unassigned": "Unassigned",
  "registry.record.ownership.recorded": "Ownership recorded",
  "registry.record.heldByYou": "You hold this work",
  "registry.record.ownershipClaimed": "Ownership claimed",
  "registry.record.ownershipRecorded": "Ownership recorded",
  "registry.record.privateCollection": "Private collection",
  "registry.record.share.copyLink": "Copy link",
  "registry.record.share.copied": "Link copied",
  "registry.record.share.prompt": "Copy this link:",
  "registry.record.claim.checkingSession": "Checking session…",
  "registry.record.claim.signIn": "Sign in to claim ownership",
  "registry.record.claim.button": "Claim ownership",
  "registry.record.claim.title": "Ownership claim",
  "registry.record.claim.request": "Request ownership",
  "registry.record.claim.recordId": "Record ID",
  "registry.record.claim.artistReview": "The artist will review your claim.",
  "registry.record.claim.placeholder": "Optional message to the artist",
  "registry.record.claim.submitting": "Submitting…",
  "registry.record.claim.submit": "Submit claim",
  "registry.record.claim.cancel": "Cancel",
  "registry.record.claim.submitted": "Claim submitted for review.",
  "registry.record.claim.pending": "You already have a pending claim for this work.",
  "registry.record.claim.error": "Could not submit claim.",
  "registry.record.technical.title": "Technical details",
  "registry.record.technical.verificationHash": "Verification hash",
  "registry.record.technical.timelineHash": "Timeline hash",
  "about.principles.title": "A registry designed for trust",
  "about.principles.p1Title": "Neutral infrastructure",
  "about.principles.p1Body":
    "A shared layer: careful in tone, explicit in what is on record, and durable over time.",
  "about.principles.p2Title": "Visibility is policy",
  "about.principles.p2Body":
    "The public layer proves the record without exposing private detail. Access is authenticated where it needs to be.",
  "about.principles.p3Title": "One identity per work",
  "about.principles.p3Body":
    "Certificates and provenance events refer to the same registry identity so documentation does not drift.",
  "about.tabs.aria": "About the registry",
  "about.tabs.sections": "Sections",
  "about.tabs.what": "What it is",
  "about.tabs.how": "How it works",
  "about.tabs.visibility": "Visibility",
  "about.tabs.properties": "Properties",
  "about.tabs.who": "Who it is for",
  "about.what.title": "What the registry is",
  "about.what.p1":
    "RROWM Registry is a system for recording authorship, provenance, and verification of artworks as durable records. Each work can receive a stable registry identity that persists across transfers and time.",
  "about.what.p2":
    "Certificates and provenance events refer to that identity, so authenticity documents and history stay aligned instead of drifting across disconnected files or claims.",
  "about.what.p3":
    "The registry is designed as infrastructure: neutral in tone, explicit about what is on record, and careful about what remains private.",
  "about.how.title": "How it works",
  "about.visibility.title": "Public record, private detail",
  "about.visibility.publicTitle": "Public registry",
  "about.visibility.certsTitle": "Certificates and account access",
  "about.visibility.ownershipTitle": "Ownership and privacy",
  "about.properties.title": "System properties",
  "about.properties.p1Title": "Immutable records",
  "about.properties.p1Body":
    "Once committed, core registry facts and timestamps are not silently rewritten. Changes are explicit, not overwritten in place.",
  "about.properties.p2Title": "Verification layer",
  "about.properties.p2Body":
    "Cryptographic checks and record linkage allow anyone with access to validate against the public layer without trusting a single intermediary.",
  "about.properties.p3Title": "Provenance tracking",
  "about.properties.p3Body":
    "Transfers and material events can be appended over time so the lineage of a work remains inspectable within policy.",
  "about.audience.title": "Who it is for",
  "about.audience.artistsLabel": "Artists & studios",
  "about.audience.artistsBody":
    "establishing a lasting record for works they stand behind, with certificates and provenance tied to one identity.",
  "about.audience.galleriesLabel": "Galleries & estates",
  "about.audience.galleriesBody":
    "maintaining continuity across exhibitions and transfers without fragmenting the story of each piece.",
  "about.audience.collectorsLabel": "Collectors & researchers",
  "about.audience.collectorsBody":
    "using the public layer to verify what is on record before going further through authenticated channels.",
  "pricing.eyebrow": "Organisation Studio · Paid access",
  "pricing.title": "Choose how your Organisation Studio uses RROWM",
  "pricing.pro.title": "Organisation Professional",
  "pricing.pro.f1": "Represented artist roster on the registry",
  "pricing.pro.f2": "Register and maintain verified works",
  "pricing.pro.f3": "Issue and support verification records and certificates",
  "pricing.pro.f4": "Operate a public institutional studio presence on the registry",
  "pricing.pro.f5": "Provide structured access for your team",
  "pricing.pro.continue": "Continue to sign up",
  "pricing.pro.nextStep": "You will create your account on the next step.",
  "pricing.enterprise.title": "Institutional Enterprise",
  "pricing.enterprise.future": "Future paid tier",
  "pricing.enterprise.f1": "Organisation-wide SSO and directory integration",
  "pricing.enterprise.f2": "White-label verification flows and API access",
  "pricing.enterprise.f3": "Advanced analytics, exports, and audit trails",
  "pricing.enterprise.f4": "Dedicated success manager and custom SLA",
  "pricing.enterprise.f5": "Contracted terms and invoicing",
  "pricing.enterprise.note":
    "Not available for self-serve yet. Talk to us about timing and fit.",
  "pricing.enterprise.contact": "Contact the registry",
  "pricing.alreadyAccount": "Already have an account?",
  "gallery.nav.studio": "Overview",
  "gallery.nav.recordDepth": "Record depth",
  "gallery.nav.roster": "Artists",
  "gallery.nav.catalogue": "Works",
  "gallery.nav.verification": "Continuity & certs",
  "gallery.nav.invitations": "Invitations",
  "gallery.shell.noCatalogueActivity": "No recent catalogue activity.",
  "gallery.shell.loading": "Loading…",
  "gallery.shell.dismiss": "Dismiss",
  "gallery.hero.tooltip":
    "Your institution's studio workspace. Manage continuity, representation, and catalogue records.",
  "gallery.hero.institutionVerified": "On file · institution verified",
  "gallery.hero.verificationPending": "Verification pending",
  "gallery.hero.subscriptionGrace": "Grace period",
  "gallery.hero.subscriptionActive": "Subscribed",
  "gallery.hero.subscriptionInactive": "Inactive",
  "gallery.hero.subscriptionTrial": "Trial",
  "gallery.hero.registryAuthority": "Registry authority",
  "gallery.hero.openCatalogue": "Open catalogue",
  "gallery.hero.work": "work",
  "gallery.hero.works": "works",
  "gallery.hero.inGalleryCatalogue": "In gallery catalogue",
  "gallery.hero.singleRegistryIds": "Single registry IDs across represented artists.",
  "gallery.hero.institutionalVerification": "Institutional verification",
  "gallery.hero.trustAndCerts": "Trust & certs",
  "gallery.hero.worksVerified": "Works verified",
  "gallery.hero.verifiedLine": "{count} verified",
  "gallery.hero.awaitingLine": "{count} awaiting",
  "gallery.hero.recordDepth": "Record depth",
  "gallery.hero.mayDeepen": "may deepen",
  "gallery.hero.institutionAttestation": "institution attestation",
  "gallery.hero.artistAttestationOnFile": "with artist attestation on file",
  "gallery.hero.inviteOutstanding": "invite outstanding",
  "gallery.hero.invitesOutstanding": "invites outstanding",
  "gallery.hero.rosterAndInvites": "Roster & invites",
  "gallery.hero.adminCanInvite": "Admin can invite from workspace",
  "gallery.hero.institutionAttestationLine":
    "{count} institution attestation · {pending} may deepen",
  "gallery.hero.artistAttestationLine":
    "{count} with artist attestation on file · {invites} invite(s) outstanding",
  "gallery.hero.openAmendments": "{count} open amendment(s): respond on file",
  "gallery.hero.amendmentsPending": "{count} amendment(s) pending review",
  "gallery.hero.newInvitation": "New invitation",
  "gallery.hero.registerWork": "Register a work",
  "gallery.hero.inviteToAuthenticate": "Invite to authenticate",
  "gallery.hero.aboutWorkspace": "About this workspace",
  "gallery.hero.publicPage": "Public page",
  "gallery.hero.account": "Account",
  "gallery.hero.previewEmpty":
    "Register a canonical record to surface a highlighted work here.",
  "gallery.intelligence.title": "Catalogue intelligence",
  "gallery.intelligence.syncing": "Syncing metrics…",
  "gallery.intelligence.registrationPace": "Registration pace",
  "gallery.intelligence.worksRegistered": "works registered",
  "gallery.intelligence.addWorksTrend": "Add works to see cumulative trend.",
  "gallery.intelligence.tapCatalogueDetail": "Tap for catalogue detail and composition.",
  "gallery.intelligence.declaredValue": "Declared value",
  "gallery.intelligence.noDeclaredValues":
    "No declared values yet. Capture value when registering works.",
  "gallery.intelligence.multiCurrencyTap": "Multi-currency progression · tap to explore.",
  "gallery.intelligence.recordHealth": "Record health",
  "gallery.intelligence.gaps": "Gaps",
  "gallery.intelligence.noData": "No data yet.",
  "gallery.intelligence.loadingBreakdown": "Loading breakdown…",
  "gallery.intelligence.certificatesAndGaps":
    "Certificates and verification gaps · tap for chart.",
  "gallery.intelligence.ofCatalogueVerified": "of catalogue verified on registry",
  "gallery.intelligence.recordsNotVerified":
    "{count} record(s) not yet verified",
  "gallery.intelligence.galleryVerificationPending":
    "Gallery verification pending. Attestation unlocks after approval.",
  "gallery.intelligence.queueClear": "Queue clear.",
  "gallery.intelligence.openVerification": "Open Verification to attest pending works.",
  "gallery.summary.representedWorks":
    "{artists} represented · {works} works",
  "gallery.summary.verifiedSuffix": " · {count} verified",
  "gallery.summary.noRecentActivity": "No recent activity.",
  "gallery.empty.createProfile": "Create your gallery profile",
  "gallery.empty.createProfileBody":
    "This establishes your presence and authority within the registry. You need a linked gallery record before the dashboard can load.",
  "gallery.empty.continueOnboarding": "Continue to gallery onboarding →",
  "gallery.fallback.gallery": "Gallery",
  "gallery.fallback.artist": "Artist",
  "gallery.fallback.untitled": "Untitled",
  "gallery.recordDepth.empty":
    "No attestations awaiting depth. When canonical records are on file, artist authentication and amendments appear here.",
  "gallery.roster.tooltip": "Linked to your gallery on the registry",
  "gallery.roster.noArtists": "No artists yet",
  "gallery.roster.noArtistsBody":
    "When you connect artists, they appear here with representation status and work counts.",
  "gallery.roster.goToInvitations": "Go to Invitations",
  "gallery.roster.askAdmin": "Ask an administrator to invite artists.",
  "gallery.roster.viewPublicProfile": "View public profile",
  "gallery.roster.noPublicProfile": "No public profile",
  "gallery.roster.artist": "artist",
  "gallery.roster.artists": "artists",
  "gallery.representation.represented": "Represented",
  "gallery.representation.historical": "Historical",
  "gallery.representation.pending": "Pending",
  "gallery.catalogue.tooltip":
    "Catalogue records filed by your institution. Register a work to open the chronology and layer institution attestations.",
  "gallery.catalogue.registerWork": "Register a work",
  "gallery.catalogue.registeredWorks": "Registered works",
  "gallery.catalogue.inCatalogue": "{count} in catalogue",
  "gallery.catalogue.empty":
    "No works in the institutional catalogue yet. Register a canonical record at any time. Artist accounts are optional.",
  "gallery.catalogue.artistOnFile": "Artist on file",
  "gallery.catalogue.artistAttestationOnFile": "Artist attestation on file",
  "gallery.catalogue.artistAttestationMayDeepen": "Artist attestation may deepen",
  "gallery.catalogue.artistAttestationNotYetOnFile": "Artist attestation not yet on file",
  "gallery.catalogue.verified": "Verified",
  "gallery.catalogue.onFile": "On file",
  "gallery.catalogue.invitationOnFile": "Invitation on file",
  "gallery.catalogue.inviteArtistAuthenticate": "Invite artist to authenticate",
  "gallery.verification.tooltip":
    "Confirm only when the record is ready. A confirmation step follows.",
  "gallery.verification.notVerifiedInstitution":
    "Your institution is not verified yet. Verification actions are unavailable.",
  "gallery.verification.nothingAwaiting": "Nothing awaiting verification.",
  "gallery.verification.markVerified": "Mark verified",
  "gallery.guide.title": "About this workspace",
  "gallery.guide.body":
    "This workspace groups your registry catalogue, participation, continuity & certs, and Invitations for optional artist authentication. Register canonical records at any time with a plain-text artist name; layered participation deepens over time: institution filing first, then artist attestation when ready.",
  "gallery.readiness.tooltip":
    "Operational checks on catalogue records, not analytics.",
  "gallery.readiness.title": "Record readiness",
  "gallery.readiness.ready": "ready",
  "gallery.readiness.needsAttention": "needs attention",
  "gallery.readiness.incomplete": "incomplete",
  "gallery.readiness.allPass": "All catalogue records pass readiness checks.",
  "gallery.integrity.tooltip":
    "Provenance integrity and completeness signals derived from your existing records.",
  "gallery.integrity.title": "Record integrity",
  "gallery.integrity.complete": "complete",
  "gallery.integrity.needsAttention": "needs attention",
  "gallery.integrity.incomplete": "incomplete",
  "gallery.integrity.allPass": "All catalogue records meet integrity checks.",
  "gallery.priority.tooltip":
    "Ordered operational guidance based on integrity, verification, value signals, market context, and recency.",
  "gallery.priority.title": "Priority queue",
  "gallery.priority.immediate": "Immediate",
  "gallery.priority.high": "High",
  "gallery.priority.standard": "Standard",
  "gallery.priority.low": "Low",
  "gallery.participation.descIntro":
    "Each work below is a canonical record on file with your institution's continuity layer.",
  "gallery.participation.descMiddle":
    "Artist attestation may deepen when the artist authenticates authorship.",
  "gallery.participation.descOutro":
    "The record is complete; layers accumulate.",
  "gallery.participation.title": "Attestations may deepen",
  "gallery.participation.record": "record",
  "gallery.participation.records": "records",
  "gallery.participation.inviteAuthenticate": "Invite to authenticate",
  "gallery.participation.untitledWork": "Untitled work",
  "gallery.participation.noImage": "No image",
  "gallery.participation.associatedArtist": "Associated artist",
  "gallery.participation.institutionLayer": " · Institution layer {when}",
  "gallery.participation.publicRecord": "Public record",
  "gallery.status.ready": "Ready",
  "gallery.status.needsAttention": "Needs attention",
  "gallery.status.incomplete": "Incomplete",
  "gallery.status.complete": "Complete",
  "gallery.invitations.hubDesc":
    "Two continuity channels: general representation, and artwork-specific authentication. The canonical record exists independently; invitations deepen participant attestations.",
  "gallery.invitations.tabRepresentation": "Representation",
  "gallery.invitations.tabArtworkAuth": "Artwork authentication",
  "gallery.invitations.tabListLabel": "Invitation type",
  "gallery.invitations.sectionTooltip":
    "Invite artists to authenticate records associated with their practice. The canonical artwork record exists independently; invitations deepen participant attestations, not gallery approval workflows.",
  "gallery.invitations.sendRepresentationLabel": "Send representation invitation",
  "gallery.invitations.artistEmail": "Artist email",
  "gallery.invitations.emailPlaceholder": "artist@example.com",
  "gallery.invitations.sentAs": "Sent as:",
  "gallery.invitations.representationBody":
    "The artist receives a formal invitation to review and confirm records on file, referencing your institution.",
  "gallery.invitations.duplicatePending":
    "An invitation is already pending for this address.",
  "gallery.invitations.resend": "Resend invitation",
  "gallery.invitations.adminOnly": "Only administrators may send invitations.",
  "gallery.invitations.noneSent": "No invitations have been sent yet.",
  "gallery.invitations.colArtist": "Artist",
  "gallery.invitations.colStatus": "Status",
  "gallery.invitations.colSentDate": "Sent date",
  "gallery.invitations.colActions": "Actions",
  "gallery.invitations.statusDeclined": "Declined",
  "gallery.invitations.copyInviteLink": "Copy invite link",
  "gallery.invitations.copied": "Copied",
  "gallery.invitations.publishing": "Publishing…",
  "gallery.invitations.publish": "Publish",
  "gallery.invitations.manualDraftHint":
    "If the invitation email could not be sent, you may copy a draft.",
  "gallery.invitations.copyDraft": "Copy draft",
  "gallery.invitations.representationSectionTitle": "Representation invitations",
  "gallery.invitations.representationSectionDesc":
    "Invite artists to join under your institution generally, separate from artwork-specific authentication.",
  "gallery.artworkAuth.sectionTitle": "Artwork authentication invitations",
  "gallery.artworkAuth.sectionDescIntro":
    "Continuity history for specific canonical records.",
  "gallery.artworkAuth.emptyBody":
    "No artwork authentication invitations yet. From Works, use {cta} on a registered record.",
  "gallery.artworkAuth.sentPrefix": "Sent",
  "gallery.artworkAuth.resend": "Resend",
  "gallery.artworkAuth.copyLink": "Copy link",
  "gallery.artworkAuth.statusAuthenticated": "Authorship authenticated",
  "gallery.artworkAuth.statusWithdrawn": "Withdrawn",
  "gallery.artworkAuth.statusExpired": "Expired",
  "gallery.artworkAuth.statusAwaiting": "Awaiting authentication",
  "gallery.artworkAuth.modalTitle": "Invite artist to authenticate",
  "gallery.artworkAuth.modalLead":
    "This artwork record is already on file within the registry. Invite the artist to authenticate authorship, deepen chronology, and contribute artist-authored detail.",
  "gallery.artworkAuth.modalOutcome":
    "The artist will receive a continuity invitation linked to this artwork specifically.",
  "gallery.artworkAuth.ctaSend": "Send continuity invitation",
  "gallery.artworkAuth.artistOnFile": "Artist on file:",
  "gallery.artworkAuth.institutionContinuityPending": "Institution continuity pending",
  "gallery.artworkAuth.personalNote": "Personal note (optional)",
  "gallery.artworkAuth.notePlaceholder":
    "A brief continuity note. Archival tone, not an approval request.",
  "gallery.artworkAuth.adminOnlyError":
    "Only gallery administrators can send artwork authentication invitations.",
  "gallery.artworkAuth.invalidEmail": "Enter a valid artist email.",
  "gallery.artworkAuth.sendFailed": "Invitation could not be sent.",
  "gallery.artworkAuth.networkError": "Network error. Try again.",
  "gallery.artworkAuth.inviteOnFile": "Invitation on file for {email}.",
  "gallery.artworkAuth.inviteSent": "Continuity invitation sent to {email}.",
  "gallery.artworkAuth.close": "Close",
  "gallery.toast.loadMembershipFailed": "Could not load gallery membership.",
  "gallery.toast.requestIncomplete": "The request did not complete ({status}).",
  "gallery.toast.inviteRecordAdminOnly":
    "Only gallery administrators can record invitations.",
  "gallery.toast.inviteDuplicateOnFile":
    "An invite for this address is already on file.",
  "gallery.toast.inviteOnFileWithDetail": "On file for {email}. {detail}",
  "gallery.toast.inviteSentTo": "Invite on file. Copy sent to {email}.",
  "gallery.toast.inviteRecordedNoEmail":
    "Recorded for {email}. Email not sent; copy the manual draft or adjust mail settings (RESEND_API_KEY, RESEND_FROM_* on email.rrowm.io, NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL).",
  "gallery.toast.inviteResentSignupLink":
    "Invite resent on file. A new signup link was sent to the artist.",
  "gallery.toast.inviteLinkRefreshedNoEmail":
    "Invite link refreshed on file. Email did not send; copy the link from the row if needed.",
  "gallery.toast.inviteVisibilityPublic":
    "Visibility updated. The artist is now Public on your institutional page.",
  "gallery.toast.couldNotPublish": "Could not publish ({status}).",
  "gallery.toast.couldNotResend": "Could not resend ({status}).",
  "gallery.toast.artworkAuthResent": "Artwork authentication invitation resent.",
  "gallery.toast.artworkAuthRefreshedNoEmail":
    "Invitation refreshed on file; email not sent.",
  "gallery.toast.copyFailed": "Could not copy. Select the text manually.",
  "gallery.toast.imageRequired":
    "Image is required to open the canonical record on file.",
  "gallery.toast.artistNameRequired":
    "Artist name is required when no roster artist is linked.",
  "gallery.toast.registerFailedDetail":
    "Work could not be registered on file. Check permissions, required fields, and that institution catalogue migrations are applied in Supabase.",
  "gallery.toast.profileAdminOnly":
    "Only gallery administrators can edit institutional presence.",
  "gallery.toast.profileSaveFailed": "Changes could not be filed.",
  "gallery.toast.verifyFailed": "Verification did not complete.",
  "gallery.toast.verifySuccess":
    "Attestation recorded. This work is now verified on the registry.",
  "gallery.toast.certificateFailed": "Certificate could not be filed.",
  "gallery.toast.certificateFiled": "Certificate filed for this work.",
  "gallery.toast.certificateAlreadyOnFile":
    "Certificate already on file for this work.",
  "gallery.toast.certificateRetryFailed":
    "Certificate could not be filed. Try again.",
  "gallery.toast.representationEndedFull":
    "Representation ended on file. Prior filings remain visible on the chronology.",
  "gallery.toast.latestActivity": "Latest activity: {title}",
  "gallery.toast.latestActivityWhen": "Latest activity: {title} · {when}",
  "gallery.toast.registerRequestFailed": "Request failed.",
  "gallery.artworkAuth.review.loading": "Loading record review…",
  "gallery.artworkAuth.review.loadFailed":
    "Could not load this record review. Please try the link again.",
  "gallery.artworkAuth.review.missingLink":
    "Missing review link. Open this page from your invitation email or artist studio.",
  "gallery.artworkAuth.review.loadFailedHint":
    "The invitation link may have expired or the record may have moved. If you received an email invitation, try the link again or contact the institution.",
  "gallery.artworkAuth.review.joinRegistry": "Join the registry",
  "gallery.artworkAuth.review.signIn": "Sign in",
  "gallery.artworkAuth.review.joinPrompt":
    "If you are an artist looking to join the registry and manage your records, you can create an account or sign in.",
  "gallery.artworkAuth.review.authFailed":
    "Could not authenticate authorship on file.",
  "gallery.artworkAuth.review.wrongEmail":
    "This invitation was sent to a different email address. Sign in with the address that received the invitation, or ask the institution to resend to your current address.",
  "gallery.artworkAuth.review.notAuthorized":
    "Your account does not match the artist named on this record. Sign in with the invited email, or contact the institution if your registry name differs.",
  "gallery.artworkAuth.review.contributeFailed": "Could not file contribution.",
  "gallery.artworkAuth.review.withdrawn":
    "This continuity invitation was withdrawn. The institution may send a new invitation linked to this artwork record if appropriate.",
  "gallery.artworkAuth.review.expired":
    "This invitation link has expired. The institution may send a new invitation linked to this artwork record.",
  "gallery.artworkAuth.review.unavailable":
    "This record review is not available. It may already be authenticated, or the invitation link may have changed.",
  "gallery.artworkAuth.review.authenticatedTitle":
    "Authorship authenticated on file",
  "gallery.artworkAuth.review.authenticatedBody":
    "You may deepen the chronology with an archival authorship contribution.",
  "gallery.artworkAuth.review.viewPublicRecord": "View public record",
  "gallery.artworkAuth.review.contributeAuthorship": "Contribute authorship",
  "gallery.artworkAuth.review.artistStudio": "Artist studio",
  "gallery.artworkAuth.review.openPublicRecord": "Open public record",
  "gallery.artworkAuth.review.openPublicRecordHint":
    "in a new tab for full chronology context.",
  "gallery.artworkAuth.review.signInPrompt":
    "Join the registry or sign in as {email} to authenticate authorship, add continuity, and deepen this record.",
  "gallery.artworkAuth.review.signInPromptGeneric":
    "Join the registry or sign in to authenticate authorship, add continuity, and deepen this record on file.",
  "gallery.artworkAuth.review.joinToReview": "Join to review",
  "gallery.artworkAuth.review.authenticateCta": "Authenticate authorship on file",
  "gallery.artworkAuth.review.viewRecordFirst": "View public record first",
  "gallery.artworkAuth.review.cardTooltip":
    "An artwork associated with your practice is on file within the registry. Review the record, then authenticate authorship to add to the continuity.",
  "gallery.artworkAuth.review.workOnFile": "Work on file",
  "gallery.artworkAuth.review.institutionLabel": "Institution on file",
  "gallery.artworkAuth.review.artistLabel": "Artist on file",
  "gallery.artworkAuth.review.personalMessage": "Personal message from institution",
  "gallery.artworkAuth.review.joinPlatformPrompt":
    "Join the registry to authenticate authorship, add to the chronology, and deepen the documentary record on file.",
  "gallery.ops.reason.registryIdMissing": "Registry ID missing",
  "gallery.ops.reason.noArtistLinked": "No artist linked",
  "gallery.ops.reason.noOwnership": "No ownership on file",
  "gallery.ops.reason.noOwnershipHistory": "No ownership history on file",
  "gallery.ops.reason.ownershipLedgerMismatch":
    "Ownership ledger does not match current owner",
  "gallery.ops.reason.titleMissing": "Title missing",
  "gallery.ops.reason.metadataFingerprintMissing": "Metadata fingerprint missing",
  "gallery.ops.reason.missingDeclaredValue": "Missing declared value",
  "gallery.ops.reason.missingImage": "Missing image",
  "gallery.ops.reason.incompleteMetadata": "Incomplete metadata (year / medium)",
  "gallery.ops.reason.certificateRevoked": "Certificate revoked",
  "gallery.ops.reason.missingVerification": "Missing verification",
  "gallery.ops.reason.noCertificateOnFile": "No certificate on file",
  "gallery.ops.reason.listedWithoutVerification":
    "Listed on market without verification",
  "gallery.ops.reason.listedWithoutCertificate":
    "Listed on market without certificate",
  "gallery.ops.reason.noDeclaredValueOnFile": "No declared value on file",
  "gallery.ops.reason.highDeclaredValue": "High declared value",
  "gallery.ops.reason.materialDeclaredValue": "Material declared value",
  "gallery.ops.reason.verifiedWithoutCertificate": "Verified without certificate",
  "gallery.ops.reason.noVerificationSignals": "No verification signals",
  "gallery.ops.reason.certifiedRecord": "Certified record",
  "gallery.ops.reason.recentActivity": "Recent activity",
  "gallery.ops.reason.oldIncomplete": "Old record still incomplete",
  "gallery.ops.reason.highValueNoCertificate": "High value without certificate",
  "gallery.ops.action.assignArtist": "Assign artist",
  "gallery.ops.action.viewRecord": "View record",
  "gallery.ops.action.completeDetails": "Complete details",
  "gallery.ops.action.addValue": "Add value",
  "gallery.ops.action.verifyRecord": "Verify record",
  "gallery.ops.action.issueCertificate": "Issue certificate",
  "gallery.ops.recommended.noAction": "No action required",
  "gallery.ops.recommended.reviewRecord": "Review record",
  "gallery.api.invalidJson": "Invalid JSON",
  "gallery.api.invalidBody": "Invalid body",
  "gallery.api.unauthorized": "Unauthorized",
  "gallery.api.missingGalleryId": "Missing gallery_id",
  "gallery.api.invalidArtistEmail": "Invalid artist_email",
  "gallery.api.inviteAdminOnly":
    "Only gallery administrators can send invitations.",
  "gallery.api.resendAdminOnly":
    "Only gallery administrators can resend invitations.",
  "gallery.api.couldNotLoadGallery": "Could not load gallery.",
  "gallery.api.galleryNotFound": "Gallery not found.",
  "gallery.api.couldNotVerifyInviteState": "Could not verify invitation state.",
  "gallery.api.alreadyInvited": "This artist has already been invited.",
  "gallery.api.couldNotRecordInvite": "Could not record invite.",
  "gallery.api.missingInviteId": "Missing invite_id or inviteId.",
  "gallery.api.inviteNotFound": "Invitation not found.",
  "gallery.api.inviteNotPending":
    "Only pending invitations can be reissued. Accepted or declined rows cannot be resent.",
  "gallery.api.missingArtworkId": "Missing artwork_id",
  "gallery.api.artworkNotFound": "Artwork not found",
  "gallery.api.noInstitutionContext":
    "This work has no institution filing context.",
  "gallery.api.emailCreatedFailed":
    "Invite on file. Email did not send; copy the link from the row if needed.",
  "gallery.api.emailUpdatedFailed":
    "Invite link refreshed on file. Email did not send; copy the link from the row if needed.",
  "gallery.api.notAuthorisedInstitution": "Not authorised for this institution",
  "gallery.api.artworkAuthDuplicatePending":
    "A pending authentication invitation already exists for this address on this work.",
  "gallery.api.artworkAuthAlreadyCompleted":
    "This invitation is already completed on file.",
  "gallery.inviteDraft.subject": "{galleryName} invited you to join the RROWM Registry",
  "gallery.inviteDraft.to": "To: {email}",
  "gallery.inviteDraft.bodyIntro":
    "{galleryName} invited you to join the RROWM Registry as a represented artist.",
  "gallery.inviteDraft.acceptLine1":
    "To accept, use the personalised link from the registry email (single-use token).",
  "gallery.inviteDraft.acceptLine2": "Sign up with exactly this invited address.",
  "gallery.inviteDraft.registrySignup":
    "Registry signup: {site}/signup?invite_token=<paste-from-registry-email-if-needed>",
  "gallery.inviteDraft.galleryPage": "Gallery page: {url}",
  "gallery.inviteDraft.galleryPagePlaceholder":
    "Gallery page: {site}/gallery/<gallery-slug>",
  "gallery.inviteDraft.afterOnboarding":
    "After you finish artist onboarding, your invitation is confirmed and your gallery may be notified.",
  "gallery.email.artistInvite.subject": "{galleryName} · Authenticate records on file",
  "gallery.email.artistInvite.preheader":
    "Authenticate and deepen records associated with your practice",
  "gallery.email.artistInvite.kicker": "Canonical record · Participant attestation",
  "gallery.email.artistInvite.body1":
    "{galleryName} participates in chronology on file for works associated with your practice. {inviteRecordExists} You are invited to authenticate authorship and deepen the documentary record, not to approve an institution upload.",
  "gallery.email.artistInvite.body2":
    "After you join: review the canonical record, authenticate authorship, add artist-authored detail, and contribute continuity events. {recordDeepensOverTime}.",
  "gallery.email.artistInvite.body3":
    "The link is for this address only, single use, and expires as set in the invitation record.",
  "gallery.email.artistInvite.cta": "Authenticate & join",
  "gallery.email.artistInvite.footnote":
    "If this was not intended for you, take no action. Do not forward the link.",
  "gallery.email.artistInvite.textIntro":
    "{galleryName} participates in chronology for works associated with your practice.",
  "gallery.email.artistInvite.textLink": "Authenticate & join (single-use link):",
  "gallery.email.artistInvite.textRegister": "Register using this email only: {email}",
  "gallery.email.artistInvite.textDisregard":
    "If this message was sent in error, disregard it.",
  "gallery.email.artworkAuth.subject":
    "Authenticate artwork record on file · {title}",
  "gallery.email.artworkAuth.preheader":
    "Review, authenticate, and deepen a canonical artwork record on file.",
  "gallery.email.artworkAuth.kicker": "Artwork record · Continuity invitation",
  "gallery.email.artworkAuth.body1":
    "An artwork associated with your practice is already on file within the registry.",
  "gallery.email.artworkAuth.body2":
    "{title}{registryLine}Filed with continuity participation from {galleryName}.",
  "gallery.email.artworkAuth.body3":
    "You are invited to review, authenticate authorship, and deepen the documentary record. {recordDeepensOverTime}. This is not an approval request or onboarding task for the institution.",
  "gallery.email.artworkAuth.noteFrom": "Note from {galleryName}:",
  "gallery.email.artworkAuth.body4":
    "The link is for this address only and expires as set in the invitation record.",
  "gallery.email.artworkAuth.cta": "Review artwork record",
  "gallery.email.artworkAuth.footnote":
    "If this was not intended for you, take no action. Do not forward the link.",
  "gallery.email.fallback.institution": "An institution",
  "gallery.email.fallback.artwork": "Work on file",
  "gallery.email.fallback.gallery": "Gallery",
  "representation.publicParticipationOnFile": "Public participation on file",
  "representation.artistAttestationOnFile": "Artist attestation on file",
  "representation.artistAttestationMayDeepen": "Artist attestation may deepen",
  "collector.nav.workspace": "Studio",
  "collector.nav.works": "Works",
  "collector.nav.attention": "Attention",
  "collector.shell.publicCollection": "Public collection",
  "collector.shell.publicListingsNote":
    "Public listings only list works where ownership is verified.",
  "collector.shell.loading": "Loading…",
  "collector.hero.fallbackCollection": "Your collection",
  "collector.hero.tooltip":
    "A quiet space for what you hold. Ownership state, attention items, and history, without catalogue marketing chrome.",
  "collector.hero.ownershipOnRecord": "Ownership on record",
  "collector.hero.viewWorks": "View works",
  "collector.hero.inStewardship": "In your studio",
  "collector.hero.studioSince": "Studio since {year}",
  "collector.hero.work": "work",
  "collector.hero.works": "works",
  "collector.hero.verifiedOwnership": "Verified ownership",
  "collector.hero.privateByDefault": "Private by default",
  "collector.hero.accountPresence": "Account & presence",
  "collector.hero.profile": "Profile",
  "collector.hero.on": "On",
  "collector.hero.off": "Off",
  "collector.hero.publicPageAvailable": "Public collection page is available.",
  "collector.hero.workspacePrivate": "No public profile. Studio stays private.",
  "collector.hero.anonymousLabel": "Anonymous label",
  "collector.hero.nameShown": "Name shown",
  "collector.hero.continuity": "Continuity",
  "collector.hero.openAttention": "Open attention ({count})",
  "collector.hero.nothingNeedsAttention": "Nothing needs attention",
  "collector.hero.item": "item",
  "collector.hero.items": "items",
  "collector.hero.attentionLabel": "Transfers, claims & verification",
  "collector.hero.actionSuggested": "Action suggested",
  "collector.hero.allClear": "All clear",
  "collector.hero.publicCollection": "Public collection",
  "collector.hero.publicPageWhenSlug": "Public page when slug is available",
  "collector.hero.registry": "Registry",
  "collector.hero.previewEmpty":
    "Works you hold will surface here with images when records include them.",
  "collector.hero.previewNoImages":
    "Images appear when works include artwork images.",
  "collector.overview.srOnly": "Collection overview",
  "collector.overview.empty":
    "No works held yet. When you claim or receive ownership, they will appear here.",
  "collector.overview.held": "{count} {units} held.",
  "collector.overview.verifiedOwnership":
    "{count} verified ownership {units}.",
  "collector.overview.pendingTransfer": "{count} pending {units}.",
  "collector.overview.notVerified":
    "{count} ownership {units} not yet verified.",
  "collector.overview.openClaims": "{count} open ownership {units}.",
  "collector.overview.withCertificate":
    "{count} {units} with a certificate on record.",
  "collector.word.work": "work",
  "collector.word.works": "works",
  "collector.word.record": "record",
  "collector.word.records": "records",
  "collector.word.transfer": "transfer",
  "collector.word.transfers": "transfers",
  "collector.word.claim": "claim",
  "collector.word.claims": "claims",
  "collector.works.title": "Works",
  "collector.works.order": "Order:",
  "collector.works.sortRecency": "Recency",
  "collector.works.sortValue": "Declared value",
  "collector.works.emptyPrefix": "Claim ownership from the",
  "collector.works.emptyLink": "registry",
  "collector.works.emptySuffix": "to build this list.",
  "collector.works.transferPending": "Transfer pending",
  "collector.works.verificationOutstanding": "Verification outstanding",
  "collector.attention.title": "Requiring attention",
  "collector.attention.empty": "Nothing calls for action right now.",
  "collector.attention.verificationPending":
    "Ownership verification pending: {title}",
  "collector.attention.transferResolve": "Transfer to resolve: {title}",
  "collector.attention.claimInProgress": "Ownership claim in progress: {title}",
  "collector.fallback.collector": "Collector",
  "collector.fallback.artist": "Artist",
  "collector.fallback.untitled": "Untitled",
  "collector.fallback.work": "Work",
  "collector.activity.emptyHold": "Activity will appear when you hold works.",
  "collector.activity.loading": "Loading…",
  "collector.activity.noEvents": "No recent events across your collection.",
  "collector.activity.saleTransferPending": "Sale: transfer pending",
  "collector.activity.valueRecorded": "Value recorded",
  "collector.activity.ownershipClaim": "Ownership claim",
  "collector.activity.ownershipUpdate": "Ownership update",
  "collector.activity.verification": "Verification",
  "collector.activity.untitledWork": "Untitled work",
  "collector.activity.detail": "{title} · {kind}",
  "collector.activity.detailWithStatus": "{title} · {kind} · {status}",
  "provenance.empty": "No chronology milestones are on file for this work yet.",
  "provenance.chronology": "Chronology",
  "provenance.chronologyIntro":
    "Entries accumulate; later filings sit alongside earlier ones. Multiple participants may appear as confirmations and custody steps are documented.",
  "provenance.supportingMaterial": "Supporting material attached",
  "provenance.certificateOnFile": "Certificate on file",
  "provenance.howFileReads": "How the file reads",
  "provenance.continuityMarkers": "Continuity markers",
  "provenance.fullChronology": "Full chronology",
  "provenance.currentRecord": "Current record",
  "provenance.event.registration": "Work entered into registry",
  "provenance.event.institutional": "Institutional relationship recorded",
  "provenance.event.artistConfirmation": "Participant confirmation added",
  "provenance.event.confirmation": "Participant confirmation recorded",
  "provenance.event.certificate": "Certificate documented on file",
  "provenance.event.custody": "Custody reflected in chronology",
  "provenance.event.continuationGeneric":
    "Chronology continued · Custodial chapter recorded",
  "provenance.event.continuationCategory":
    "Chronology continued · {category} recorded",
  "provenance.event.disputeOpen": "Record reviewed · formal channel opened",
  "provenance.event.supportingMaterial": "Supporting material attached",
  "provenance.event.disputeResolved": "Formal review concluded",
  "provenance.transfer.ownership": "Ownership transfer",
  "provenance.transfer.initial": "Initial record",
  "provenance.transfer.update": "Record update",
  "provenance.transfer.event": "Ownership event",
  "provenance.category.privateTransfer": "Private transfer",
  "provenance.category.sale": "Sale",
  "provenance.category.gift": "Gift",
  "provenance.category.inheritance": "Inheritance",
  "provenance.category.continuation": "Continuation",
  "provenance.participant.registeredArtist": "Attributed to registered artist",
  "provenance.participant.representedInstitution": "Represented institution",
  "provenance.participant.attributedArtist": "Attributed artist",
  "provenance.participant.issuingAuthority": "Issuing authority recorded",
  "provenance.participant.independentReview": "Independent registry review",
  "provenance.participant.attributedTo": "Attributed to {name}",
  "provenance.participant.fromTo": "From {from} to {to}",
  "provenance.verification.openingFacts": "Opening facts on file",
  "provenance.verification.participantConfirmation":
    "Participant confirmation on file",
  "provenance.verification.artistAttestation": "On file · artist attestation",
  "provenance.verification.confirmation": "Confirmation on file",
  "provenance.verification.document": "Document on file",
  "provenance.verification.participantConfirmed": "Participant-confirmed on file",
  "provenance.verification.claim": "On file · claim",
  "provenance.verification.recorded": "On file · recorded",
  "provenance.verification.reviewProcess": "Review process on file",
  "provenance.verification.appendedReview": "Appended to review file",
  "provenance.verification.outcome": "Outcome on file",
  "provenance.verification.outcomeDismissed": "Outcome on file · dismissed",
  "provenance.continuity.chainIntact":
    "Chronological custody chain without recorded breaks",
  "provenance.continuity.custodyMilestone":
    "Participant-confirmed custody milestone on file",
  "provenance.continuity.supportingMaterial": "Supporting material on file",
  "provenance.continuity.alignsWithCustody":
    "Institutional or artist confirmations align with verified custody",
  "provenance.continuity.continuedByParticipants":
    "Chronology continued by recorded participants",
  "provenance.completeness.high": "Layered file",
  "provenance.completeness.moderate": "Growing file",
  "provenance.completeness.limited": "Opening file",
  "provenance.completeness.highDesc":
    "Several kinds of filing sit together (studio records, custody sequence, and documents) so the chronology reads with more historical depth.",
  "provenance.completeness.moderateDesc":
    "Core facts are on file; further participant confirmations or custody milestones may still arrive.",
  "provenance.completeness.limitedDesc":
    "Only part of the story is visible here until more is filed on the chronology.",
  "provenance.temporal.sinceYear": "Continuously documented since {year}.",
  "provenance.temporal.multipleChapters":
    "This chronology has expanded across multiple custodial chapters.",
  "provenance.temporal.spanYears": "Chronology filings span more than one calendar year.",
  "provenance.temporal.institutionContinuity":
    "Institution-linked continuity remains on file.",
  "provenance.insight.noVerification": "This work has no verification signals.",
  "provenance.insight.ownershipUnverified": "Current ownership is unverified.",
  "provenance.insight.saleIncomplete":
    "Sale recorded. Ownership transfer incomplete.",
  "provenance.insight.fullyVerified": "Fully verified record.",
  "provenance.insight.noRecentActivity": "No recent activity recorded.",
  "about.journey.recordTitle": "Record",
  "about.journey.recordSubtitle": "A unique registry identity for each work",
  "about.journey.verifyTitle": "Verify",
  "about.journey.verifySubtitle": "Cryptographic proof & immutable timestamps",
  "about.journey.certifyTitle": "Certify",
  "about.journey.certifySubtitle": "Authenticity documents tied to the record",
  "about.journey.traceTitle": "Trace",
  "about.journey.traceSubtitle": "Ownership & value history over time",
  "about.journey.then": "then",
  "studio.search.byTitle": "Search by title…",
  "studio.search.artworks": "Search artworks…",
  "studio.search.certificates": "Search certificates…",
  "studio.filter.artworks": "Filter artworks",
  "studio.filter.certificates": "Filter certificates",
  "studio.filter.ownership": "Filter ownership records",
  "studio.filter.verifiedOnly": "Verified only",
  "studio.filter.notVerified": "Not verified",
  "studio.filter.withDeclaredValue": "With declared value",
  "studio.filter.noDeclaredValue": "No declared value",
  "studio.registerArtwork": "Register artwork",
  "studio.artworks.noMatches": "No works match your search or filter.",
  "studio.artworks.verified": "Verified",
  "studio.artworks.notVerified": "Not verified",
  "studio.artworks.verifiedTooltip": "Verified on the record.",
  "studio.artworks.recordValue": "Record value",
  "studio.artworks.noRecordId": "No record ID",
  "studio.artworks.emptyLabel": "Your studio",
  "studio.artworks.emptyTitle": "No represented works on file yet",
  "studio.certificates.all": "All certificates",
  "studio.certificates.withImage": "With artwork image",
  "studio.certificates.withoutImage": "Without image",
  "studio.certificates.noMatches": "No certificates match your search or filter.",
  "studio.certificates.imagePlaceholder": "Registry record",
  "studio.certificates.registryCertificate": "Registry certificate",
  "studio.certificates.open": "Open →",
  "studio.certificates.emptyLabel": "Registry certificates",
  "studio.certificates.emptyTitle": "No verified certificates yet",
  "studio.ownership.filterAll": "All records ({count})",
  "studio.ownership.filterNeedsTransfer": "Needs transfer ({count})",
  "studio.ownership.filterSold": "Sold ({count})",
  "studio.ownership.filterHeldByYou": "Held by you ({count})",
  "studio.ownership.noMatches": "No ownership records match your search or filter.",
  "studio.ownership.noTransfers": "No transfers yet",
  "studio.ownership.transferLedger": "{count} transfer on the ledger",
  "studio.ownership.transferLedgerPlural": "{count} transfers on the ledger",
  "studio.ownership.you": "You",
  "studio.ownership.unassigned": "Unassigned",
  "studio.ownership.collectorId": "Collector ({id}…)",
  "studio.ownership.saleLogged": "Sale logged: finish transfer",
  "studio.ownership.lastEventSale": "Last event · Sale",
  "studio.ownership.inYourCustody": "In your custody",
  "studio.ownership.currentHolder": "Current holder",
  "studio.ownership.chainDepth": "Chain depth",
  "studio.ownership.transfersOnRecord": "{count} transfer on record",
  "studio.ownership.transfersOnRecordPlural": "{count} transfers on record",
  "studio.ownership.noRegistryId": "No registry ID",
  "studio.ownership.ledgerLink": "Ledger →",
  "studio.ownership.emptyLabel": "Ownership",
  "studio.ownership.emptyTitle": "No ownership activity yet",
  "studio.hero.fallbackArtist": "Artist",
  "studio.hero.catalogue": "Catalogue",
  "studio.hero.openArtworks": "Open artworks",
  "studio.hero.registeredInStudio": "Registered in studio",
  "studio.hero.work": "work",
  "studio.hero.works": "works",
  "studio.hero.verifiedBadge": "{count} verified",
  "studio.hero.pricedBadge": "{count} priced",
  "studio.hero.recordsToDeepen":
    "{count} record to authenticate & deepen on file",
  "studio.hero.recordsToDeepenPlural":
    "{count} records to authenticate & deepen on file",
  "studio.hero.amendmentNeedsResponse": "{count} amendment need your response",
  "studio.hero.amendmentsNeedResponse": "{count} amendments need your response",
  "studio.hero.recordHealth": "Record health",
  "studio.hero.certificates": "Certificates",
  "studio.hero.verified": "Verified",
  "studio.hero.priced": "Priced",
  "studio.hero.publicStudio": "Public studio",
  "studio.hero.artistPage": "Artist page",
  "studio.hero.notPublishedYet": "Not published yet",
  "studio.hero.viewPublicPage": "View public page",
  "studio.hero.setupPresence": "Set up presence",
  "studio.hero.ownershipLedger": "Ownership ledger",
  "studio.hero.previewEmpty": "Register a work to see your catalogue preview here.",
  "studio.loading.opening": "Opening studio…",
  "studio.form.title": "Title",
  "studio.form.titleRequired": "Title *",
  "studio.form.year": "Year",
  "studio.form.medium": "Medium",
  "studio.form.dimensions": "Dimensions",
  "studio.form.description": "Description",
  "studio.form.visibility": "Visibility",
  "studio.form.image": "Image",
  "studio.form.imageRequired": "Image *",
  "studio.form.initialAmount": "Initial amount (optional)",
  "studio.form.currency": "Currency",
  "studio.form.eventType": "Event type",
  "studio.form.visibilityPrivate": "Private",
  "studio.form.visibilityGallery": "Gallery",
  "studio.form.visibilityPublic": "Public",
  "studio.form.visibilityCertificate": "Certificate",
  "studio.form.eventInitial": "Initial",
  "studio.form.eventPrimarySale": "Primary Sale",
  "studio.form.eventSecondarySale": "Secondary Sale",
  "studio.form.eventAppraisal": "Appraisal",
  "studio.form.eventInternalEstimate": "Internal Estimate",
  "studio.register.titleNew": "Register new artwork",
  "studio.register.titleGallery": "Register a work",
  "studio.register.issueCanonical": "Issue canonical record",
  "studio.register.artistName": "Artist name",
  "studio.register.asCreditedPlaceholder": "As credited on the work",
  "studio.register.plainTextHint":
    "Plain text is sufficient. An artist account is not required to open the canonical record.",
  "studio.register.artistEmailOptional": "Artist email (optional)",
  "studio.register.emailInvitePlaceholder":
    "For a later authenticate & deepen invitation",
  "studio.register.linkRosterOptional": "Link to roster artist (optional)",
  "studio.register.noAccountLink": "No account link, name on file only",
  "studio.register.placeholderTitle": "Artwork title",
  "studio.register.placeholderYear": "2024",
  "studio.register.placeholderMedium": "Oil on canvas",
  "studio.register.placeholderDimensions": "48 × 36 in",
  "studio.register.placeholderDescription": "Describe the work…",
  "studio.register.placeholderAmount": "e.g. 50000",
  "studio.artworkDetail.valueHistory": "Value history",
  "studio.artworkDetail.noValueHistory": "No value history yet",
  "studio.valueEvent.title": "Record value event",
  "studio.valueEvent.declaredAmount": "Declared amount",
  "studio.valueEvent.amountPlaceholder": "Amount",
  "studio.valueEvent.noteOptional": "Note (optional)",
  "studio.valueEvent.notePlaceholder": "Optional context",
  "studio.valueEvent.helpAmount":
    "The figure you are logging for this event (valuation, sale price, estimate, etc.). Match what was actually stated or agreed. This becomes part of your provenance trail.",
  "studio.valueEvent.helpCurrency":
    "ISO currency for the amount above. Choose the currency the value was quoted in, not an implied conversion.",
  "studio.valueEvent.helpEventTypes":
    "Initial: first recorded anchor. Primary sale: first sale from the artist or primary market. Secondary sale: resale. Appraisal: formal valuation. Internal estimate: studio reference figure.",
  "studio.valueEvent.helpVisibility":
    "Private: only you in the studio. Gallery: shared in gallery contexts. Certificate: can appear on the certificate layer. Public: eligible for public registry surfaces when policy allows.",
  "studio.valueEvent.helpNotes":
    "Optional context: fair, channel, buyer type, appraiser, or anything that helps future you interpret this event.",
  "studio.overview.valueCoverage.title": "Value & coverage",
  "studio.overview.valueCoverage.subtitle":
    "Totals and how complete your registry records are.",
  "studio.overview.totalValue": "Total value",
  "studio.overview.totalValueCurrency": "Total value ({currency})",
  "studio.overview.noPricedWorks": "No priced works yet",
  "studio.overview.avgValueCurrency": "Avg value ({currency})",
  "studio.overview.recordHealth": "Record health",
  "studio.overview.priced": "Priced",
  "studio.overview.pricedHint": "Works with a declared value",
  "studio.overview.verifiedHint": "Verified in the registry",
  "studio.overview.locked": "Locked",
  "studio.overview.lockedHint": "Immutable after verification",
  "studio.overview.ownershipRequests.title": "Ownership requests",
  "studio.overview.ownershipRequests.subtitle":
    "Collectors requesting recognition. Review and respond.",
  "studio.overview.noPendingClaims":
    "No pending claims. When a collector submits a claim on your work, it will appear here.",
  "studio.overview.pendingReview": "Pending review",
  "studio.overview.claimant": "Claimant",
  "studio.overview.valueProgression.title": "Value progression",
  "studio.overview.valueProgression.subtitle":
    "How values move from initial to latest where comparable.",
  "studio.overview.avgChange": "Avg change in value",
  "studio.overview.avgChangeHint":
    "Mean % change where initial and latest share a currency.",
  "studio.overview.worksIncreased": "Works with increased value",
  "studio.overview.decliningWorks": "Declining works",
  "studio.overview.noProgressionData": "No progression data yet",
  "studio.overview.valueChange": "Value change",
  "studio.overview.ownershipIntel.title": "Ownership intelligence",
  "studio.overview.ownershipIntel.subtitle":
    "Transfers, holds, and movement across your catalogue.",
  "studio.overview.totalTransfers": "Total transfers",
  "studio.overview.worksYouHold": "Works you still hold",
  "studio.overview.avgHoldDays": "Avg hold (days)",
  "studio.overview.catalogueHighlights.title": "Catalogue highlights",
  "studio.overview.catalogueHighlights.subtitle":
    "Standout records from your registry activity.",
  "studio.overview.mostTransferred": "Most transferred",
  "studio.overview.mostTransferredHint": "Highest transfer count.",
  "studio.overview.longestHeld": "Longest held",
  "studio.overview.longestHeldHint":
    "Longest span between first and latest transfer.",
  "studio.overview.fastestAppreciating": "Fastest appreciating",
  "studio.overview.fastestAppreciatingHint":
    "Largest % gain from initial to latest (same currency).",
  "studio.records.noAwaitingAttestation":
    "No records awaiting your attestation. When a canonical record is associated with your practice, it appears here to authenticate and deepen.",
  "studio.records.institutionalRelationship": "Institutional relationship",
  "studio.records.relationshipOnFile": "Relationship on file",
  "studio.records.endOnFile": "End on file",
  "studio.records.linkedWith": "Linked with {name}.",
  "studio.records.linkVisibleAfterEnding":
    "Your institution link remains visible on prior filings after ending.",
  "representation.canonicalRecordOnFile": "Canonical artwork record on file",
  "representation.recordDeepensOverTime":
    "The record deepens as participants contribute attestations",
  "representation.institutionAttestationOnFile":
    "Institution-linked continuity on file",
  "representation.priorContributionsRemainVisible":
    "Prior contributions remain visible on the chronology",
  "representation.historicalInstitutionLayer":
    "Historical institutional participation remains on file",
  "representation.inviteRecordExists":
    "A canonical record associated with your practice is already on file",
  "representation.notApprovalWorkflow":
    "Layered attestations only, not ownership adjudication or institution approval",
  "representation.representationOnFile": "Institutional relationship on file",
  "representation.priorFilingsRemainVisible":
    "Prior contributions remain visible on the chronology",
  "representation.amendmentPendingReview": "Amendment open on file",
  "studio.records.deepen.eyebrow": "Canonical records",
  "studio.records.deepen.title": "Authenticate & deepen",
  "studio.records.deepen.description":
    "{inviteRecordExists}. {recordDeepensOverTime}. You contribute attestations. The work is not provisional and you are not approving an institution upload.",
  "studio.records.deepen.badge": "{count} record to deepen",
  "studio.records.deepen.badgePlural": "{count} records to deepen",
  "studio.records.deepen.step1":
    "Review the canonical record as it stands on file",
  "studio.records.deepen.step2": "Authenticate authorship as your attestation",
  "studio.records.deepen.step3":
    "File an archival authorship contribution on the chronology",
  "studio.records.deepen.step4":
    "Optionally acknowledge institutional relationship on the record",
  "studio.records.deepen.opened": "Opened {when}",
  "studio.records.deepen.reviewAuthenticate": "Review & authenticate",
  "studio.records.deepen.publicRecord": "Public record",
  "studio.records.deepen.contributeAuthorship": "Contribute authorship",
  "studio.records.deepen.authenticateAuthorship": "Authenticate authorship",
  "studio.records.deepen.institution": "Institution",
  "studio.amendments.eyebrow": "Representation amendments",
  "studio.amendments.title": "Chronicle updates",
  "studio.amendments.description":
    "Proposed catalogue refinements stay tentative until the counterpart accepts them on file. Prior attestations remain visible: accumulative chronology, not replacement.",
  "studio.amendments.responseNeeded": "1 response needed",
  "studio.amendments.responsesNeeded": "{count} responses needed",
  "studio.amendments.newRequest": "New amendment request",
  "studio.amendments.empty": "No amendment requests on file yet.",
  "studio.amendments.workFallback": "Work",
  "studio.amendments.institution": "Institution",
  "studio.amendments.representedArtist": "Represented artist",
  "studio.amendments.roleArtist": "Artist",
  "studio.amendments.roleInstitution": "Institution",
  "studio.amendments.initiated": "initiated",
  "studio.amendments.statusAccepted": "Accepted on file",
  "studio.amendments.statusDeclined": "Declined",
  "studio.amendments.statusWithdrawn": "Withdrawn",
  "studio.amendments.resolution": "Resolution:",
  "studio.amendments.viewPublicRecord": "View public record",
  "studio.amendments.responseNote": "Response note",
  "studio.amendments.responsePlaceholder": "Response note (optional)",
  "studio.amendments.acceptOnFile": "Accept on file",
  "studio.amendments.decline": "Decline",
  "studio.amendments.withdrawRequest": "Withdraw request",
  "studio.amendments.modalTitle": "New amendment request",
  "studio.amendments.chooseWork": "Choose a work.",
  "studio.amendments.noteRequired": "Add a note describing the proposed change.",
  "studio.amendments.noteDescribe":
    "Describe what should change. Optional catalogue fields apply only if the counterpart accepts. They merge into the record on file.",
  "studio.amendments.requestFailed": "Request could not be sent.",
  "studio.amendments.submitRequest": "Submit request",
  "studio.authorship.title": "Deepen the record",
  "studio.authorship.workFallback": "Work on file",
  "studio.authorship.statement": "Authorship statement",
  "studio.authorship.statementPlaceholder":
    "How you understand authorship for this work: practice, intent, or documentary context…",
  "studio.authorship.chronology": "Chronology contribution",
  "studio.authorship.chronologyPlaceholder":
    "Dates, production context, exhibition history, or continuity you want on file…",
  "studio.authorship.filing": "Filing contribution…",
  "studio.authorship.fileContribution": "File contribution on chronology",
  "studio.endRepresentation.title": "End representation on file",
  "studio.endRepresentation.noteOptional": "Note (optional)",
  "studio.endRepresentation.notePlaceholder":
    "e.g. roster change, contract concluded…",
  "studio.endRepresentation.acknowledge":
    "I understand prior institution filings and chronology entries remain visible on the public record.",
  "studio.toast.verificationRequestFailed":
    "Verification request could not be recorded.",
  "studio.toast.verificationRequestRecorded":
    "Verification request recorded on file.",
  "studio.toast.sessionEnded": "Session ended. Sign in again to continue.",
  "studio.toast.verificationIncomplete": "Verification did not complete.",
  "studio.toast.custodyVerified": "Custody step verified on the chronology.",
  "studio.toast.connectionInterrupted":
    "Connection interrupted. Reconnect, then open the studio again.",
  "studio.toast.contributionFailed": "Could not file contribution.",
  "studio.toast.contributionFiled":
    "Authorship contribution filed on the chronology.",
  "studio.toast.contributionError": "Could not file contribution.",
  "studio.toast.confirmFailed": "Could not confirm.",
  "studio.toast.confirmRecorded": "Confirmation recorded on file.",
  "studio.toast.confirmError": "Could not confirm.",
  "studio.toast.amendmentResolveFailed": "Could not resolve amendment.",
  "studio.toast.amendmentAccepted": "Amendment accepted on file.",
  "studio.toast.amendmentDeclined": "Amendment declined on file.",
  "studio.toast.amendmentResolveError": "Could not resolve amendment.",
  "studio.toast.withdrawFailed": "Could not withdraw.",
  "studio.toast.amendmentWithdrawn": "Amendment withdrawn on file.",
  "studio.toast.withdrawError": "Could not withdraw.",
  "studio.toast.endRepresentationFailed": "Could not end representation.",
  "studio.toast.representationEnded": "Representation ended on file.",
  "studio.toast.endRepresentationError": "Could not end representation.",
  "studio.toast.amendmentRequestFiled":
    "Amendment request filed on the chronology.",
  "studio.toast.activityLogFailed":
    "Activity log could not be written. The underlying action may still be on file.",
  "studio.toast.claimApproveFailed": "Claim could not be approved.",
  "studio.toast.custodyLedgerFailed": "Custody ledger could not be opened.",
  "studio.toast.custodyRowUpdateFailed": "Custody row could not be updated.",
  "studio.toast.custodyRowRecordFailed": "Custody row could not be recorded.",
  "studio.toast.claimRecorded": "Ownership claim recorded on the chronology.",
  "studio.toast.claimWithdrawFailed": "Claim could not be withdrawn.",
  "studio.toast.claimWithdrawn": "Claim withdrawn from review.",
  "studio.toast.registerFailed": "Work could not be registered on file.",
  "studio.toast.valueFilingFailed": "Value filing could not be recorded.",
  "studio.toast.valueEventRecorded": "Value event recorded on file.",
  "studio.toast.buyerUuidInvalid": "Buyer account id must be a UUID.",
  "studio.toast.buyerIdRequired": "Buyer account id is required.",
  "studio.toast.buyerNameRequired": "Buyer name is required for this filing.",
  "studio.toast.recordingTransfer": "Recording transfer on file…",
  "studio.toast.transferFailed": "Transfer could not be filed: {error}",
  "studio.toast.transferOwnerUpdateFailed":
    "Transfer recorded; current owner could not be updated automatically.",
  "studio.toast.transferContinued": "Chronology continued for this transfer.",
  "studio.ledger.saleRecorded": "Sale recorded",
  "studio.ledger.completeTransfer":
    "Complete ownership transfer to keep provenance accurate.",
  "studio.ledger.recordTransferDetails": "Record transfer details",
  "studio.ledger.transferDetails": "Transfer details",
  "studio.ledger.sellerPrefilled": "Seller (prefilled)",
  "studio.ledger.sellerUserIdPlaceholder": "Seller user id",
  "studio.ledger.buyer": "Buyer",
  "studio.ledger.externalBuyer": "External buyer",
  "studio.ledger.existingUser": "Existing user",
  "studio.ledger.buyerUserIdPlaceholder": "Buyer user id (UUID)",
  "studio.ledger.buyerNamePlaceholder": "Buyer name",
  "studio.ledger.buyerType.collector": "Collector",
  "studio.ledger.buyerType.gallery": "Gallery",
  "studio.ledger.buyerType.institution": "Institution",
  "studio.ledger.buyerType.private": "Private",
  "studio.ledger.buyerType.unknown": "Unknown",
  "studio.ledger.externalBuyerNote": "External buyers don't need an account.",
  "studio.ledger.saleType": "Sale type",
  "studio.ledger.saleTypePrimary": "Primary",
  "studio.ledger.saleTypeSecondary": "Secondary",
  "studio.ledger.dateOfSale": "Date of sale",
  "studio.ledger.notes": "Notes",
  "studio.ledger.notesPlaceholder": "Optional context (invoice, venue, etc.)",
  "studio.ledger.saveTransfer": "Save transfer",
  "studio.ledger.title": "Ownership ledger",
  "studio.ledger.artworkFallback": "Artwork",
  "studio.ledger.valueHistorySubtitle":
    "Every declared value event for this work.",
  "studio.ledger.noValueEvents": "No value events recorded yet.",
  "studio.ledger.noAdditionalContext": "No additional context",
  "studio.ledger.visibility": "Visibility",
  "studio.ledger.ownershipHistory": "Ownership history",
  "studio.ledger.ownershipHistorySubtitle":
    "Every transfer and confirmation for this work.",
  "studio.ledger.noOwnershipEvents": "No ownership events recorded yet.",
  "studio.ledger.currentOwner": "Current owner",
  "studio.ledger.claimedByYou": "You have claimed ownership",
  "studio.ledger.claimedByOther": "Ownership claimed by another collector",
  "studio.ledger.from": "From",
  "studio.ledger.requestVerification": "Request verification",
  "studio.ledger.submitting": "Submitting…",
  "studio.ledger.verifyOwnership": "Verify ownership",
  "studio.ledger.verifying": "Verifying…",
  "studio.ledger.integrityNotes": "Integrity notes",
  "studio.ledger.integritySubtitle":
    "Any anomalies or special situations with this work's ownership journey will appear here.",
  "studio.ledger.noIntegrityData": "No integrity data available.",
  "studio.ledger.integrityEventOn": "{type} on {date}",
  "studio.ledger.unknownOwner": "Unknown owner",
  "studio.ledger.unknown": "Unknown",
  "studio.ledger.status.verified": "Owned (verified)",
  "studio.ledger.status.claimed": "Ownership claimed",
  "studio.ledger.status.unassigned": "Unassigned",
  "studio.ledger.status.recorded": "Ownership recorded",
  "studio.ledger.valueType.sale": "Sale recorded",
  "studio.ledger.valueType.auction": "Auction recorded",
  "studio.ledger.transferType.transfer": "Ownership transfer",
  "studio.ledger.transferType.initial": "Initial record",
  "studio.ledger.transferType.correction": "Record update",
  "studio.ledger.transferType.sale": "Sale",
  "studio.ledger.confirm.areYouSure": "Are you sure you want to continue?",
  "studio.ledger.confirm.working": "Working…",
  "studio.ledger.confirm.adminVerify.title": "Verify this ownership step?",
  "studio.ledger.confirm.adminVerify.body":
    "You are about to mark this ownership transfer as verified. You are telling the registry this change of hands is correct and should read as trusted, permanent history for the artwork, similar to signing off on a formal record.\n\nOnly continue if you have checked the sale or transfer details and you are comfortable that they are accurate. Reversing or editing this kind of decision later is difficult, so it deserves a deliberate second look.",
  "studio.ledger.confirm.adminVerify.confirm": "Yes, verify ownership",
  "studio.ledger.confirm.requestVerification.title":
    "Request verification for this transfer?",
  "studio.ledger.confirm.requestVerification.body":
    "You are asking to move this ownership step forward in the verification process. That request becomes part of the work's provenance story and may be visible to others who rely on the registry.\n\nUse this when you believe the transfer details are correct and you want them reviewed, not as a casual click. Make sure what you see in the ledger matches what actually happened.",
  "studio.ledger.confirm.requestVerification.confirm": "Yes, submit request",
  "studio.insight.fallbackTitle": "Insight",
  "studio.insight.loadingSeries": "Retrieving series on file…",
  "studio.insight.noSeriesData": "No series data for this period.",
  "studio.insight.howToRead": "How to read this",
  "studio.insight.breakdownHeading": "Breakdown",
  "studio.insight.notesHeading": "Notes",
  "studio.insight.defaultValueLabel": "Value",
  "studio.insight.loadFailed": "Could not load this insight. Try again.",
  "studio.insight.title.worksArtist": "Catalogue highlights",
  "studio.insight.title.worksGallery": "Catalogue over time",
  "studio.insight.title.health": "Record health",
  "studio.insight.title.valueArtist": "Value progression",
  "studio.insight.title.valueGallery": "Declared value",
  "studio.insight.line.worksArtist": "Works",
  "studio.insight.line.worksGallery": "Cumulative works",
  "studio.insight.breakdown.totalWorks": "Total works",
  "studio.insight.breakdown.uniqueWorks": "Unique works",
  "studio.insight.breakdown.unique": "Unique",
  "studio.insight.breakdown.editionWorks": "Edition works",
  "studio.insight.breakdown.editions": "Editions",
  "studio.insight.breakdown.mostActivePeriod": "Most active period",
  "studio.insight.breakdown.peakPeriod": "Peak period",
  "studio.insight.breakdown.fullyVerifiedStrict": "Fully verified (strict)",
  "studio.insight.breakdown.withCertificate": "With certificate",
  "studio.insight.breakdown.missingVerification": "Missing verification",
  "studio.insight.breakdown.latestDeclared": "Latest declared ({currency})",
  "studio.insight.bar.fullyVerified": "Fully verified",
  "studio.insight.bar.certified": "Certified",
  "studio.insight.bar.incomplete": "Incomplete",
  "studio.insight.note.healthNonAdditive":
    "These bars are not additive: one work can count toward more than one category.",
  "studio.insight.note.healthStrictArtist":
    "“Fully verified” needs a non-revoked certificate, a gallery attestation, and verified ownership. That bar is stricter than the per-row “verified” badge in your studio list.",
  "studio.insight.note.healthStrictGallery":
    "“Fully verified” needs a non-revoked certificate, a gallery attestation, and verified ownership. That bar is stricter than the per-row “verified” badge on each artwork.",
  "studio.insight.note.valueBasisArtist":
    "Figures are the latest declared value per currency from your value events (the same basis as the chart series), not a roll-up of every artwork’s current list price.",
  "studio.insight.note.valueBasisGallery":
    "Figures are the latest declared value per currency from value events (the same basis as the chart series), not a roll-up of every artwork’s current list price.",
  "studio.insight.subtitle.artist.catalogueSteadyGrowth":
    "The catalogue has grown steadily.",
  "studio.insight.subtitle.artist.clearOwnership":
    "The catalogue shows a clear ownership record.",
  "studio.insight.subtitle.artist.ownershipPending":
    "Some ownership continuity is pending on file.",
  "studio.insight.subtitle.artist.continuityNeeded":
    "Some works may need continuity recorded to complete the file.",
  "studio.insight.subtitle.artist.valuesShifted":
    "Latest recorded values have shifted versus prior periods.",
  "studio.insight.subtitle.artist.valuesSteady":
    "Latest recorded values are steady compared with prior entries.",
  "studio.insight.subtitle.artist.multiCurrencyTracked":
    "Values are tracked in more than one currency.",
  "studio.insight.subtitle.artist.addValueEvent":
    "Add a value event to see progression here.",
  "studio.insight.subtitle.artist.value.noEvents12mo":
    "No value events in the last 12 months.",
  "studio.insight.subtitle.artist.value.multiCurrency":
    "Values are tracked in multiple currencies; each line uses its own scale.",
  "studio.insight.subtitle.artist.value.trendingUp":
    "Latest recorded values are trending up versus prior entries.",
  "studio.insight.subtitle.artist.value.softened":
    "Latest recorded values have softened versus prior entries.",
  "studio.insight.subtitle.artist.value.steady":
    "Latest recorded values are steady compared with prior entries.",
  "studio.insight.subtitle.gallery.registrySteady":
    "Registry activity is steady across your represented works.",
  "studio.insight.subtitle.gallery.ownershipPending":
    "Some ownership continuity is pending on file.",
  "studio.insight.subtitle.gallery.verificationSteady":
    "Verification activity is steady across your studio.",
  "studio.insight.subtitle.gallery.recordsPending":
    "Some records are still pending on file.",
  "studio.insight.subtitle.gallery.value.noDeclared":
    "No declared values in this window for represented works.",
  "studio.insight.subtitle.gallery.value.multiCurrency":
    "Declared values span multiple currencies across your studio.",
  "studio.insight.subtitle.gallery.value.trendingUp":
    "Latest declared values are trending up across your studio.",
  "studio.insight.subtitle.gallery.value.softened":
    "Latest declared values have softened across recent periods.",
  "studio.insight.subtitle.gallery.value.steady":
    "Declared values are steady across recent periods.",
  "studio.insight.subtitle.collector.ownershipPending":
    "Some ownership continuity is pending on file.",
  "studio.insight.subtitle.collector.ownershipEstablished":
    "Ownership records are well established.",
  "studio.insight.subtitle.collector.multiCurrency":
    "The collection is recorded across multiple currencies.",
  "studio.insight.subtitle.collector.consistentRecord":
    "The collection shows a consistent record over time.",
  "studio.insight.subtitle.collector.value.noEvents":
    "No recorded values in this window.",
  "studio.insight.subtitle.collector.value.multiCurrency":
    "Your collection spans multiple currencies.",
  "studio.insight.subtitle.collector.value.trendingUp":
    "Latest recorded values are trending up.",
  "studio.insight.subtitle.collector.value.softened":
    "Latest recorded values have softened.",
  "studio.insight.subtitle.collector.value.steady":
    "Recorded values are holding steady.",
  "studio.activity.artworkRegistered": "Artwork registered: {title}",
  "studio.activity.valueUpdated": "Value updated: {title}",
  "studio.activity.ownershipConfirmed": "Ownership confirmed: {title}",
  "studio.activity.ownershipClaimRejected": "Ownership claim rejected",
  "studio.activity.authInviteSent":
    "Authentication invitation sent for {title}{registrySuffix} to {email}",
  "studio.activity.authenticatedAuthorship":
    "Authenticated authorship: {title}{registrySuffix}",
  "studio.activity.representationConfirmed":
    "Confirmed representation: {title}{registrySuffix}",
  "studio.activity.provenanceInitiated":
    "Continuity transfer initiated: {title}{registrySuffix} → {recipient}",
  "studio.activity.provenanceAccepted":
    "Accepted continuity transfer: {title}{registrySuffix}",
  "studio.activity.provenanceCompleted":
    "Continuity transfer completed: {title}{registrySuffix}",
  "studio.activity.galleryInviteSent":
    "Representation invitation sent to {email}",
  "studio.activity.accountDeletionRequested":
    "Account deletion requested for {email}",
  "studio.activity.artworkVerified": "Artwork verified: {title}{registrySuffix}",
  "studio.activity.certificateIssued": "Certificate issued: {title}{registrySuffix}",
  "studio.activity.artistOnboarded":
    "{artist} completed registry onboarding for {gallery}.",
  "studio.activity.personalArchiveAdded": "Added to personal archive: {title}{registrySuffix}",
  "studio.activity.personalArchiveRemoved":
    "Removed from personal archive: {title}{registrySuffix}",
  "studio.activity.collectorOwnershipDeclared":
    "Ownership declaration recorded: {title}{registrySuffix}",
  "studio.activity.galleryInviteAccepted": "Gallery invitation accepted",
  "studio.activity.unknown": "Activity recorded",
  "registry.record.certificateOverview": "Certificate overview",
};

const DE: Record<MessageKey, string> = {
  ...EN,
  "common.perMonth": "pro Monat",
  "nav.registry": "Register",
  "nav.field": "The Field",
  "nav.about": "Über uns",
  "nav.signIn": "Anmelden",
  "nav.takePart": "Mitmachen",
  "nav.myAccount": "Mein Konto",
  "nav.stewardship": "Studio",
  "nav.signOut": "Abmelden",
  "nav.account": "Konto",
  "nav.regionLabel": "Region & Sprache",
  "ecosystem.role.creative": "Creative",
  "ecosystem.role.organisation": "Organisation",
  "ecosystem.role.collector": "Sammler",
  "ecosystem.surface.studio": "Studio",
  "ecosystem.surface.field": "The Field",
  "ecosystem.surface.registry": "Register",
  "field.home.title": "Öffentliche Entdeckung und Präsenz",
  "field.home.lede":
    "The Field ist der Ort, an dem Sie Creatives, Organisationen und Register-Einträge durchsuchen — schreibgeschützte Oberflächen, die widerspiegeln, was Teilnehmende öffentlich machen. Im Studio werden Identität und Verwaltung bearbeitet.",
  "field.home.explorerHeading": "Explorer",
  "field.home.explorerBody":
    "Drei Indexansichten — Creatives, Organisationen und Register-Einträge — mit Filtern und Paginierung. Keine Empfehlungen oder bezahltes Ranking.",
  "field.home.verifyHeading": "Verifizieren",
  "field.home.verifyBody":
    "Verifizierungs- und Zertifikatsstatus für einen Register-Eintrag anhand der Registry-ID prüfen.",
  "field.home.verifyLink": "Verifizierung öffnen",
  "field.home.registryNote":
    "Das Register bleibt das System of Record. The Field liest daraus; im Studio werden Einträge und Profile verwaltet.",
  "field.explorer.subNavLabel": "Field-Explorer",
  "field.explorer.tab.creatives": "Creatives",
  "field.explorer.tab.organisations": "Organisationen",
  "field.explorer.tab.records": "Einträge",
  "field.explorer.hub.title": "Explorer",
  "field.explorer.creatives.headline": "Creatives entdecken",
  "field.explorer.creatives.lede":
    "Öffentliche Creative-Profile auf The Field — Praxis, Verifizierung und Register-Footprint. Nur Entdeckung; kein Marktplatz.",
  "field.explorer.creatives.searching": "Suche",
  "field.explorer.creatives.filtered": "Filter aktiv",
  "field.explorer.creatives.filter.search": "Nach Name suchen",
  "field.explorer.creatives.filter.searchPlaceholder": "Name…",
  "field.explorer.creatives.filter.practice": "Praxis",
  "field.explorer.creatives.filter.allPractices": "Alle Praktiken",
  "field.explorer.creatives.filter.verification": "Verifizierung",
  "field.explorer.creatives.filter.allCreatives": "Alle Creatives",
  "field.explorer.creatives.filter.verifiedOnly": "Verifiziert auf Datei",
  "field.explorer.creatives.filter.verifiedHint":
    "Creatives mit verifizierten Register-Einträgen oder Künstlerbestätigung auf Datei.",
  "field.explorer.creatives.filter.sort": "Sortierung",
  "field.explorer.creatives.filter.apply": "Anwenden",
  "field.explorer.creatives.sort.nameAsc": "Name A–Z",
  "field.explorer.creatives.sort.nameDesc": "Name Z–A",
  "field.explorer.creatives.sort.recent": "Zuletzt aktualisiert",
  "field.explorer.creatives.empty.none":
    "Noch keine öffentlichen Creatives. Profile können im Studio aktiviert werden.",
  "field.explorer.creatives.empty.filtered":
    "Keine Creatives entsprechen der Suche oder den Filtern.",
  "field.explorer.creatives.empty.clearFilters": "Filter zurücksetzen",
  "field.stub.preparing":
    "Diese Route ist für Phase 2A vorbereitet. Inhalte und Daten folgen in den nächsten PR1-Schritten.",
  "field.stub.backHome": "Zurück zu The Field",
  "field.verify.title": "Verifizieren",
  "field.verify.record.title": "Eintragsverifizierung",
  "field.verify.hub.title": "Register-Eintrag verifizieren",
  "field.verify.hub.lede":
    "The Field zeigt Vertrauen aus dem Register — Verifizierungsstatus, Beteiligung und Zertifikatsstatus. The Field erteilt keine Verifizierung; es liest Register-Wahrheit.",
  "field.verify.hub.lookupHeading": "Per Register-ID prüfen",
  "field.verify.hub.lookupIntro":
    "Geben Sie die Registry ID eines Eintrags ein, um den öffentlichen Verifizierungsstatus anzuzeigen.",
  "field.verify.hub.lookupLabel": "Registry ID",
  "field.verify.hub.lookupPlaceholder": "z. B. RROWM-…",
  "field.verify.hub.lookupSubmit": "Status prüfen",
  "field.verify.hub.lookupHint":
    "Nur öffentlicher Status. Vollständige Zertifikate erfordern Anmeldung.",
  "field.verify.hub.lookupRequired": "Bitte eine Registry ID eingeben.",
  "field.verify.hub.hierarchyTitle": "Reihenfolge der Vertrauenssignale",
  "field.verify.hub.hierarchyIntro":
    "Lesen Sie Signale auf The Field in dieser Reihenfolge. Register-Fakten haben Vorrang vor Profiltext.",
  "field.verify.hub.tier1.label": "Stufe 1 — Register-Eintrag",
  "field.verify.hub.tier1.body":
    "Registry ID, Verifizierungsstatus des Eintrags und Künstlerbestätigung im Register.",
  "field.verify.hub.tier2.label": "Stufe 2 — Organisation & verifizierte Werke",
  "field.verify.hub.tier2.body":
    "Organisations-Verifizierung und sachliche Zähler verifizierter Werke — keine Popularitätswerte.",
  "field.verify.hub.tier3.label": "Stufe 3 — Zertifikat",
  "field.verify.hub.tier3.body":
    "Ob ein Zertifikat für einen verifizierten Eintrag auf Datei ist oder widerrufen wurde.",
  "field.verify.hub.section.verification.title": "Was Verifizierung bedeutet",
  "field.verify.hub.section.verification.body":
    "Verifizierung ist die Bestätigung des Registers, dass ein Eintrag definierte Bestätigungen auf Datei hat — ledger-gestützt, kein Social-Badge.",
  "field.verify.hub.section.provenance.title": "Was Provenienz bedeutet",
  "field.verify.hub.section.provenance.body":
    "Provenienz ist die chronologische Kontinuität eines Register-Eintrags — bestätigte Ereignisse auf Datei.",
  "field.verify.hub.section.registryRecord.title": "Was Register-Einträge sind",
  "field.verify.hub.section.registryRecord.body":
    "Ein Register-Eintrag ist der kanonische Kontinuitätseintrag für ein Werk. The Field liest; das Register bleibt System of Record.",
  "field.verify.hub.section.howVerification.title": "Wie Verifizierung funktioniert",
  "field.verify.hub.section.howVerification.body":
    "Teilnehmende verwalten Einträge im Studio. Status wird im Register geschrieben. The Field zeigt read-only.",
  "field.verify.hub.section.certificates.title": "Wie Zertifikate funktionieren",
  "field.verify.hub.section.certificates.body":
    "Nach Verifizierung kann ein Zertifikat auf Datei sein. Öffentliche Prüfung zeigt den Status; das Dokument erfordert Anmeldung.",
  "field.verify.hub.linkRecords": "Register-Einträge durchsuchen",
  "field.presence.creative.title": "Creative-Profil",
  "field.presence.organisation.title": "Organisationsprofil",
  "field.presence.collector.title": "Sammlerprofil",
  "field.record.title": "Register-Eintrag",
  "ecosystem.workspace.studio": "Studio",
  "ecosystem.workspace.organisationStudio": "Organisations-Studio",
  "getStarted.pathTooltip":
    "Jeder Weg öffnet den passenden Studio-Arbeitsbereich für Ihren Teilnehmertyp. Darunter: eine Chronologie pro Werk, im Register dokumentiert.",
  "account.hero.organisationIdentity": "Organisationsidentität",
  "account.profile.organisationProfile": "Organisationsprofil",
  "account.profile.publicProfileHint":
    "Biografie und Links auf Ihrem öffentlichen Profil.",
  "footer.navigate": "Navigation",
  "footer.access": "Zugang",
  "footer.legal": "Rechtliches",
  "footer.social": "Social Media",
  "footer.registry": "Register",
  "footer.field": "The Field",
  "footer.about": "Über uns",
  "footer.contact": "Kontakt",
  "footer.signIn": "Anmelden",
  "footer.register": "Registrieren",
  "footer.account": "Konto",
  "footer.privacy": "Datenschutz",
  "footer.terms": "AGB",
  "footer.disclaimer": "Haftungsausschluss",
  "footer.tagline": "Register · Dokumentation · institutioneller Eintrag",
  "footer.copyright": "Alle Rechte vorbehalten.",
  "footer.regionLabel": "Region & Sprache",
  "footer.blurb":
    "Ein kryptografisch verifizierbares Register für zeitgenössische Kunst, das Urheberschaft und Provenienz schützt.",
  "landing.hero.title": "Infrastruktur für kulturelles Gedächtnis",
  "landing.hero.lede":
    "Ein vertrauenswürdiges Provenienzregister für zeitgenössisches Kulturwerk — Urheberschaft, Eigentum und historische Dokumentation in einem sich entwickelnden Archiv.",
  "landing.hero.browseCatalogue": "Öffentliche Galerie durchsuchen",
  "landing.hero.takePart": "Mitmachen",
  "landing.hero.overview": "Überblick",
  "landing.cta.title": "An der Kontinuität eines Werks mitwirken",
  "landing.cta.takePart": "Mitmachen →",
  "landing.cta.browseRegistry": "Register durchsuchen",
  "landing.thesis.title":
    "Kontinuität gehört zum Werk, nicht verstreut in Dateien",
  "landing.thesis.card1Title": "Aktueller Stand",
  "landing.thesis.card1Body":
    "Ein Katalogeintrag pro Werk: die Liste, gegen die Sie heute prüfen.",
  "landing.thesis.card2Title": "Chronologie in der Akte",
  "landing.thesis.card2Body":
    "Meilensteine sammeln sich in Reihenfolge; spätere Einreichungen stehen neben früheren.",
  "landing.thesis.card3Title": "Rollen der Teilnehmenden",
  "landing.thesis.card3Body":
    "Institutionelle Zuordnung und Sammler-Studio-Aktivität erscheinen dort, wo Teilnehmende sie einreichen.",
  "landing.flow.title":
    "Ein Faden für das Werk, von der ersten Listung bis zum Nächsten",
  "landing.flow.s1Label": "Werk benennen",
  "landing.flow.s1Detail":
    "Einmal listen. Das Stück erhält eine dauerhafte Identität, zu der Künstler, Galerien und Sammler zurückkehren.",
  "landing.flow.s2Label": "Relevantes anfügen",
  "landing.flow.s2Detail":
    "Zertifikate, Galeriezuordnung, Custody-Notizen: alles landet im selben Eintrag statt in verstreuten Dateien.",
  "landing.flow.s3Label": "Gegenwart klar sehen",
  "landing.flow.s3Detail":
    "Was heute öffentlich ist, ist leicht zu lesen. Privates bleibt hinter der Anmeldung, bis Sie es freigeben.",
  "landing.flow.s4Label": "Den Faden wachsen lassen",
  "landing.flow.s4Detail":
    "Jeder Verkauf, Transfer oder jede Ausstellung fügt der gleichen Geschichte eine weitere Zeile hinzu.",
  "landing.workspace.title": "Wo Bestände in der Akte bleiben",
  "landing.workspace.takePart": "Mitmachen",
  "landing.workspace.viewPublic": "Öffentliche Ebene ansehen",
  "landing.portfolio.title": "Portfoliomanagement für jede Rolle",
  "getStarted.title": "Wählen Sie, wie Sie mitmachen",
  "getStarted.alreadyAccount": "Bereits ein Konto?",
  "getStarted.signIn": "Anmelden",
  "getStarted.roleNote": "Ihre Rolle folgt Ihrem Profil, nicht nur dieser Seite.",
  "getStarted.artistTitle": "Ich bin Creative",
  "getStarted.artistDesc":
    "Werke registrieren, damit Präsenz, Chronologie und Zertifikate in einem Register-Eintrag bleiben.",
  "getStarted.artistCta": "Als Creative fortfahren",
  "getStarted.galleryTitle": "Ich vertrete eine Organisation",
  "getStarted.galleryDesc":
    "Verifizierte Organisations-Workflows: Bestätigungen und Einträge für vertretene Creatives in der Akte.",
  "getStarted.galleryCta": "Pläne ansehen und fortfahren",
  "getStarted.collectorTitle": "Ich bin Sammlerin / Sammler",
  "getStarted.collectorDesc":
    "Öffentlichen Katalog durchsuchen, aktuellen Stand lesen und Custody einreichen, wenn Sie ein Werk halten.",
  "getStarted.collectorCta": "Als Sammler fortfahren",
  "getStarted.catalogueTitle": "Im Katalog",
  "auth.signIn": "Anmelden",
  "auth.resetPassword": "Passwort zurücksetzen",
  "auth.accessSubtitle": "Greifen Sie mit E-Mail und Passwort auf Ihr Register zu.",
  "auth.createAccount": "Konto erstellen",
  "auth.resetSubtitle":
    "Geben Sie die E-Mail Ihres Kontos ein. Wir senden einen sicheren Link für ein neues Passwort.",
  "auth.email": "E-Mail",
  "auth.password": "Passwort",
  "auth.forgotPassword": "Passwort vergessen?",
  "auth.rememberMe": "Angemeldet bleiben",
  "auth.signingIn": "Anmeldung…",
  "auth.sendReset": "Link senden",
  "auth.sending": "Wird gesendet…",
  "auth.backToSignIn": "Zur Anmeldung",
  "auth.needHelp": "Hilfe benötigt?",
  "auth.getStarted": "Loslegen",
  "auth.artworkAuthHint":
    "Melden Sie sich an, um den Werk-Eintrag zu prüfen und zu authentifizieren.",
  "cookie.message":
    "Wir verwenden Cookies für Kernfunktionen und zur Verbesserung der Erfahrung.",
  "cookie.privacy": "Datenschutz",
  "cookie.terms": "AGB",
  "cookie.accept": "Akzeptieren",
  "cookie.decline": "Ablehnen",
  "contact.title": "Kontakt",
  "contact.lede": "Für allgemeine Anfragen, Partnerschaften oder institutionelle Anliegen.",
  "contact.note":
    "Wir lesen jede Nachricht; Antwortzeiten hängen von Umfang und Art der Anfrage ab. Datenexport, Kontolöschung und andere Datenschutzrechte können Sie unter Mein Konto → Datenschutz & Daten selbst ausführen.",
  "registry.hero.headline": "Verifizierte Einträge durchsuchen",
  "registry.hero.lede":
    "Erkunden Sie bei RROWM registrierte Werke. Öffnen Sie einen Eintrag für die verbindliche Verifikation; die Werkseite bietet eine kuratierte Darstellung.",
  "registry.hero.trustNote":
    "Nur verifizierte Werke erscheinen in diesem Index. Zertifikatsdokumente sind in der öffentlichen Übersicht nicht sichtbar. Melden Sie sich an, um ein vollständiges Zertifikat zu sehen, sofern verfügbar.",
  "registry.hero.searching": "Suche",
  "registry.hero.clearSearch": "Suche löschen",
  "archive.nav.personalArchive": "Persönliches Archiv",
  "archive.page.title": "Persönliches Archiv",
  "archive.page.lede":
    "Werke, die Sie griffbereit halten, während sich ihr Registereintrag weiter entwickelt.",
  "archive.action.archive": "Archivieren",
  "archive.action.archived": "Archiviert",
  "archive.action.remove": "Aus dem Archiv entfernen",
  "archive.count.one": "In {count} persönlichem Archiv",
  "archive.count.many": "In {count} persönlichen Archiven",
  "archive.footnote":
    "Dieses Werk erscheint in persönlichen Archiven von Teilnehmenden im Register.",
  "archive.empty.title": "Noch keine archivierten Werke",
  "archive.empty.body":
    "In Ihrem persönlichen Archiv bleiben Werke leicht zugänglich, während sich der Eintrag weiter entwickelt.",
  "archive.empty.cta": "Katalog durchsuchen",
  "archive.loading": "Archiv wird geladen…",
  "archive.error.generic": "Diese Aktion konnte nicht ausgeführt werden.",
  "archive.error.session": "Seite aktualisieren und erneut versuchen.",
  "archive.card.statusVerified": "Verifiziert im Register",
  "archive.card.statusRecorded": "Im Register erfasst",
  "archive.card.noImage": "Kein Bild hinterlegt",
  "archive.card.archivedOn": "Archiviert am {date}",
  "archive.card.currentRecord": "Aktueller Eintrag",
  "archive.card.viewWork": "Werk ansehen",
  "registry.filters.search": "Suche",
  "registry.filters.searchPlaceholder": "Titel oder Register-ID",
  "registry.filters.sort": "Sortierung",
  "registry.filters.sortNewest": "Neueste zuerst",
  "registry.filters.sortOldest": "Älteste zuerst",
  "registry.filters.sortTitleAsc": "Titel A–Z",
  "registry.filters.sortTitleDesc": "Titel Z–A",
  "registry.filters.status": "Status",
  "registry.filters.allWorks": "Alle Werke",
  "registry.filters.apply": "Anwenden",
  "registry.empty.label": "Register",
  "registry.empty.title": "Keine Einträge",
  "registry.empty.noSearch":
    "Keine verifizierten Werke entsprechen Ihrer Suche. Probieren Sie andere Begriffe oder löschen Sie die Suche.",
  "registry.empty.noRecords":
    "Noch keine verifizierten Werke. Schauen Sie später wieder vorbei.",
  "registry.list.title": "Verifizierte Einträge",
  "registry.list.page": "Seite {page}",
  "registry.card.registryId": "Register-ID",
  "registry.card.noImage": "Kein Bild hinterlegt",
  "registry.card.untitled": "Ohne Titel",
  "registry.card.added": "Hinzugefügt",
  "registry.card.certStatus": "Zertifikatsstatus:",
  "registry.cert.verified": "Verifiziert",
  "registry.cert.revoked": "Widerrufen",
  "registry.card.viewRecord": "Registereintrag ansehen",
  "registry.card.verifyCert": "Zertifikat prüfen",
  "registry.card.viewCertLogin": "Zertifikat ansehen (Anmeldung erforderlich)",
  "registry.card.artworkPage": "Werkseite",
  "registry.pagination.showing": "{start}–{end} von {total}",
  "registry.pagination.previous": "Zurück",
  "registry.pagination.next": "Weiter",
  "registry.pagination.pageOf": "Seite {page} von {totalPages}",
  "about.hero.title":
    "Ein System zur Erfassung von Urheberschaft, Provenienz und Verifikation",
  "signup.joinTitle": "Register beitreten",
  "signup.createArtistAccount": "Creative-Konto erstellen",
  "signup.subtitleArtworkAuth":
    "Nach der Einrichtung kehren Sie zurück, um den Werk-Eintrag zu prüfen und zu authentifizieren.",
  "signup.signingUpAs": "Sie registrieren sich als",
  "signup.studioDesc":
    "Ihr Studio bündelt vertretene Werke, Chronologie-Aktionen und den aktuellen Stand.",
  "signup.alreadyRegistered": "Bereits registriert?",
  "signup.otherEntryPaths": "Andere Einstiege",
  "signup.workEmail": "Berufliche E-Mail",
  "signup.confirmPassword": "Passwort bestätigen",
  "signup.passwordPlaceholder": "Mindestens 8 Zeichen",
  "signup.confirmPlaceholder": "Passwort erneut eingeben",
  "signup.creatingProfile": "Profil wird erstellt…",
  "signup.createProfile": "Profil erstellen",
  "signup.checkEmail":
    "Prüfen Sie Ihre E-Mail zur Bestätigung und kehren Sie in diesem Browser zurück, um die Einrichtung abzuschließen.",
  "signup.role.artist": "Creative",
  "signup.role.gallery": "Organisation",
  "signup.role.collector": "Sammler",
  "signup.err.inviteBlocked":
    "Diese Einladung kann nicht zur Registrierung verwendet werden.",
  "signup.err.emailRequired": "Geben Sie Ihre E-Mail-Adresse ein.",
  "signup.err.passwordLength": "Das Passwort muss mindestens 8 Zeichen haben.",
  "signup.err.passwordMismatch": "Passwörter stimmen nicht überein.",
  "signup.invite.title": "Einladung",
  "signup.invite.verifying": "Einladung wird geprüft…",
  "signup.invite.oneMoment": "Einen Moment.",
  "signup.invite.fetchError": "Diese Einladung konnte nicht verifiziert werden",
  "signup.invite.expired": "Diese Einladung ist abgelaufen",
  "signup.invite.used": "Diese Einladung wurde bereits verwendet",
  "signup.invite.invalid": "Diese Einladung ist ungültig",
  "signup.invite.usedSubtitle":
    "Wenn Sie bereits ein Konto haben, melden Sie sich unten an. Andernfalls erstellen Sie ein neues Konto.",
  "signup.invite.fallbackSubtitle":
    "Sie können dem Register weiterhin beitreten. Erstellen Sie ein Konto oder melden Sie sich an.",
  "signup.invite.trustFooter":
    "Diese Einladung wurde über das RROWM-Register gesendet. Ihre Angaben dienen nur der Profilerstellung und dem, was für vertretene Werke in der Akte erscheint.",
  "signup.invite.createArtistProfile": "Künstlerprofil erstellen",
  "signup.invite.galleryInvited":
    "hat Sie eingeladen, Einträge in der Akte zu authentifizieren. Nach der Profilerstellung prüfen und vertiefen Sie jeden Eintrag.",
  "signup.invite.directedTo":
    "Diese Einladung richtet sich an {email}. Verwenden Sie diese Adresse bei der Registrierung.",
  "signup.invite.recordsTitle": "Mit Ihrer Praxis verknüpfte Einträge",
  "signup.invite.noArtworks":
    "Von {gallery} eingereichte Einträge erscheinen nach dem Beitritt in Ihrem Studio. Sie können prüfen, Urheberschaft authentifizieren und Einträge vertiefen.",
  "signup.invite.joinMasked":
    "Treten Sie als {email} dem Register bei, um Urheberschaft zu authentifizieren, Kontinuität hinzuzufügen und Einträge zu vertiefen.",
  "signup.invite.joinGeneric":
    "Treten Sie dem Register bei, um Urheberschaft zu authentifizieren, Kontinuität hinzuzufügen und Einträge zu vertiefen.",
  "signup.invite.attestationNote":
    "Nur gestaffelte Attestierungen, keine Eigentumsentscheidung oder Institutionsfreigabe.",
  "signup.invite.joinToAuthenticate": "Beitreten und authentifizieren",
  "studio.nav.studio": "Studio",
  "studio.nav.records": "Einträge",
  "studio.nav.artworks": "Werke",
  "studio.nav.certificates": "Zertifikate",
  "studio.nav.ownership": "Eigentum",
  "studio.shell.activity": "Aktivität",
  "studio.shell.recentNotes": "Neueste Notizen",
  "studio.shell.catalogueActivity": "Katalogaktivität",
  "studio.shell.browseCatalogue": "Öffentliche Galerie durchsuchen",
  "studio.shell.noActivity": "Noch keine Aktivität.",
  "registry.record.trust.revokedHeadline": "Zertifikat widerrufen",
  "registry.record.trust.revokedSub": "Dieser Eintrag ist markiert. Nicht als verifiziert behandeln.",
  "registry.record.trust.verifiedHeadline": "Verifizierter Eintrag",
  "registry.record.trust.verifiedSubCert":
    "Zertifikat in der Akte. Vollständiges Dokument für berechtigte Nutzer.",
  "registry.record.trust.verifiedSubNoCert":
    "Im Register erfasst; noch kein Zertifikat ausgestellt.",
  "registry.record.trust.unverifiedHeadline": "Registereintrag",
  "registry.record.trust.unverifiedSub": "Werk registriert, noch nicht verifiziert.",
  "registry.record.verificationBy": "Verifikation erfasst von {name}",
  "registry.record.badge.certificate": "Zertifikat",
  "registry.record.badge.noCertificate": "Kein Zertifikat",
  "registry.record.badge.locked": "Gesperrt",
  "registry.record.aboutWork": "Über dieses Werk",
  "registry.record.specifications": "Spezifikationen",
  "registry.record.provenance": "Provenienz",
  "registry.record.certStatusTitle": "Zertifikatsstatus",
  "registry.record.verificationTitle": "Verifikation",
  "gallery.nav.studio": "Überblick",
  "gallery.nav.recordDepth": "Eintragstiefe",
  "gallery.nav.roster": "Künstler",
  "gallery.nav.catalogue": "Werke",
  "gallery.nav.verification": "Kontinuität & Zertifikate",
  "gallery.nav.invitations": "Einladungen",
  "gallery.shell.noCatalogueActivity": "Noch keine Katalogaktivität.",
  "gallery.shell.loading": "Wird geladen…",
  "gallery.shell.dismiss": "Schließen",
  "gallery.hero.tooltip":
    "Der Studio-Arbeitsbereich Ihrer Institution. Verwalten Sie Kontinuität, Repräsentation und Katalogeinträge.",
  "gallery.hero.institutionVerified": "In der Akte · Institution verifiziert",
  "gallery.hero.verificationPending": "Verifikation ausstehend",
  "gallery.hero.subscriptionGrace": "Karenzzeit",
  "gallery.hero.subscriptionActive": "Abonniert",
  "gallery.hero.subscriptionInactive": "Inaktiv",
  "gallery.hero.subscriptionTrial": "Testphase",
  "gallery.hero.registryAuthority": "Register-Autorität",
  "gallery.hero.openCatalogue": "Katalog öffnen",
  "gallery.hero.work": "Werk",
  "gallery.hero.works": "Werke",
  "gallery.hero.inGalleryCatalogue": "Im Galeriekatalog",
  "gallery.hero.singleRegistryIds":
    "Einzelne Register-IDs über vertretene Künstler hinweg.",
  "gallery.hero.institutionalVerification": "Institutionelle Verifikation",
  "gallery.hero.trustAndCerts": "Vertrauen & Zertifikate",
  "gallery.hero.worksVerified": "Verifizierte Werke",
  "gallery.hero.verifiedLine": "{count} verifiziert",
  "gallery.hero.awaitingLine": "{count} ausstehend",
  "gallery.hero.recordDepth": "Eintragstiefe",
  "gallery.hero.mayDeepen": "kann vertieft werden",
  "gallery.hero.institutionAttestation": "Institutionsattestierung",
  "gallery.hero.artistAttestationOnFile": "mit Künstlerattestierung in der Akte",
  "gallery.hero.inviteOutstanding": "Einladung ausstehend",
  "gallery.hero.invitesOutstanding": "Einladungen ausstehend",
  "gallery.hero.rosterAndInvites": "Roster & Einladungen",
  "gallery.hero.adminCanInvite": "Admin kann aus dem Arbeitsbereich einladen",
  "gallery.hero.institutionAttestationLine":
    "{count} Institutionsattestierung · {pending} kann vertieft werden",
  "gallery.hero.artistAttestationLine":
    "{count} mit Künstlerattestierung in der Akte · {invites} Einladung(en) ausstehend",
  "gallery.hero.openAmendments":
    "{count} offene Änderung(en): in der Akte antworten",
  "gallery.hero.amendmentsPending": "{count} Änderung(en) zur Prüfung ausstehend",
  "gallery.hero.newInvitation": "Neue Einladung",
  "gallery.hero.registerWork": "Werk registrieren",
  "gallery.hero.inviteToAuthenticate": "Zur Authentifizierung einladen",
  "gallery.hero.aboutWorkspace": "Über diesen Arbeitsbereich",
  "gallery.hero.publicPage": "Öffentliche Seite",
  "gallery.hero.account": "Konto",
  "gallery.hero.previewEmpty":
    "Registrieren Sie einen kanonischen Eintrag, um hier ein hervorgehobenes Werk anzuzeigen.",
  "gallery.intelligence.title": "Katalog-Intelligence",
  "gallery.intelligence.syncing": "Metriken werden synchronisiert…",
  "gallery.intelligence.registrationPace": "Registrierungstempo",
  "gallery.intelligence.worksRegistered": "Werke registriert",
  "gallery.intelligence.addWorksTrend":
    "Werke hinzufügen, um den kumulativen Trend zu sehen.",
  "gallery.intelligence.tapCatalogueDetail":
    "Tippen für Katalogdetail und Zusammensetzung.",
  "gallery.intelligence.declaredValue": "Deklarierter Wert",
  "gallery.intelligence.noDeclaredValues":
    "Noch keine deklarierten Werte. Erfassen Sie Werte bei der Registrierung.",
  "gallery.intelligence.multiCurrencyTap":
    "Mehrwährungsverlauf · tippen zum Erkunden.",
  "gallery.intelligence.recordHealth": "Eintragsgesundheit",
  "gallery.intelligence.gaps": "Lücken",
  "gallery.intelligence.noData": "Noch keine Daten.",
  "gallery.intelligence.loadingBreakdown": "Aufschlüsselung wird geladen…",
  "gallery.intelligence.certificatesAndGaps":
    "Zertifikate und Verifikationslücken · tippen für Diagramm.",
  "gallery.intelligence.ofCatalogueVerified":
    "des Katalogs im Register verifiziert",
  "gallery.intelligence.recordsNotVerified":
    "{count} Eintrag/Einträge noch nicht verifiziert",
  "gallery.intelligence.galleryVerificationPending":
    "Galerieverifikation ausstehend. Attestierung nach Freigabe möglich.",
  "gallery.intelligence.queueClear": "Warteschlange leer.",
  "gallery.intelligence.openVerification":
    "Verifikation öffnen, um ausstehende Werke zu attestieren.",
  "gallery.summary.representedWorks":
    "{artists} vertreten · {works} Werke",
  "gallery.summary.verifiedSuffix": " · {count} verifiziert",
  "gallery.summary.noRecentActivity": "Keine jüngste Aktivität.",
  "gallery.empty.createProfile": "Galerieprofil erstellen",
  "gallery.empty.createProfileBody":
    "Dies etabliert Ihre Präsenz und Autorität im Register. Ein verknüpfter Galerieeintrag ist erforderlich, bevor das Dashboard geladen werden kann.",
  "gallery.empty.continueOnboarding": "Weiter zur Galerie-Onboarding →",
  "gallery.fallback.gallery": "Galerie",
  "gallery.fallback.artist": "Künstler",
  "gallery.fallback.untitled": "Ohne Titel",
  "gallery.recordDepth.empty":
    "Keine Attestierungen warten auf Vertiefung. Wenn kanonische Einträge in der Akte sind, erscheinen hier Künstlerauthentifizierung und Änderungen.",
  "gallery.roster.tooltip": "Mit Ihrer Galerie im Register verknüpft",
  "gallery.roster.noArtists": "Noch keine Künstler",
  "gallery.roster.noArtistsBody":
    "Wenn Sie Künstler verbinden, erscheinen sie hier mit Repräsentationsstatus und Werkzahlen.",
  "gallery.roster.goToInvitations": "Zu Einladungen",
  "gallery.roster.askAdmin": "Bitten Sie einen Administrator, Künstler einzuladen.",
  "gallery.roster.viewPublicProfile": "Öffentliches Profil ansehen",
  "gallery.roster.noPublicProfile": "Kein öffentliches Profil",
  "gallery.roster.artist": "Künstler",
  "gallery.roster.artists": "Künstler",
  "gallery.representation.represented": "Vertreten",
  "gallery.representation.historical": "Historisch",
  "gallery.representation.pending": "Ausstehend",
  "gallery.catalogue.tooltip":
    "Von Ihrer Institution eingereichte Katalogeinträge. Registrieren Sie ein Werk, um die Chronologie zu öffnen und Institutionsattestierungen zu ergänzen.",
  "gallery.catalogue.registerWork": "Werk registrieren",
  "gallery.catalogue.registeredWorks": "Registrierte Werke",
  "gallery.catalogue.inCatalogue": "{count} im Katalog",
  "gallery.catalogue.empty":
    "Noch keine Werke im institutionellen Katalog. Registrieren Sie jederzeit einen kanonischen Eintrag. Künstlerkonten sind optional.",
  "gallery.catalogue.artistOnFile": "Künstler in der Akte",
  "gallery.catalogue.artistAttestationOnFile": "Künstlerattestierung in der Akte",
  "gallery.catalogue.artistAttestationMayDeepen": "Künstlerattestierung kann vertieft werden",
  "gallery.catalogue.artistAttestationNotYetOnFile":
    "Künstlerattestierung noch nicht in der Akte",
  "gallery.catalogue.verified": "Verifiziert",
  "gallery.catalogue.onFile": "In der Akte",
  "gallery.catalogue.invitationOnFile": "Einladung in der Akte",
  "gallery.catalogue.inviteArtistAuthenticate": "Künstler zur Authentifizierung einladen",
  "gallery.verification.tooltip":
    "Bestätigen Sie nur, wenn der Eintrag bereit ist. Ein Bestätigungsschritt folgt.",
  "gallery.verification.notVerifiedInstitution":
    "Ihre Institution ist noch nicht verifiziert. Verifikationsaktionen sind nicht verfügbar.",
  "gallery.verification.nothingAwaiting": "Nichts wartet auf Verifikation.",
  "gallery.verification.markVerified": "Als verifiziert markieren",
  "gallery.guide.title": "Über diesen Arbeitsbereich",
  "gallery.guide.body":
    "Dieser Arbeitsbereich bündelt Ihren Registerkatalog, Teilnahme, Kontinuität & Zertifikate sowie Einladungen zur optionalen Künstlerauthentifizierung. Registrieren Sie kanonische Einträge jederzeit mit einem Klartext-Künstlernamen; geschichtete Teilnahme vertieft sich: zuerst institutionelle Einreichung, dann Künstlerattestierung wenn bereit.",
  "gallery.readiness.tooltip":
    "Operative Prüfungen an Katalogeinträgen, keine Analytik.",
  "gallery.readiness.title": "Eintragsbereitschaft",
  "gallery.readiness.ready": "bereit",
  "gallery.readiness.needsAttention": "Aufmerksamkeit nötig",
  "gallery.readiness.incomplete": "unvollständig",
  "gallery.readiness.allPass":
    "Alle Katalogeinträge bestehen die Bereitschaftsprüfungen.",
  "gallery.integrity.tooltip":
    "Provenienzintegrität und Vollständigkeitssignale aus Ihren bestehenden Einträgen.",
  "gallery.integrity.title": "Eintragsintegrität",
  "gallery.integrity.complete": "vollständig",
  "gallery.integrity.needsAttention": "Aufmerksamkeit nötig",
  "gallery.integrity.incomplete": "unvollständig",
  "gallery.integrity.allPass":
    "Alle Katalogeinträge erfüllen die Integritätsprüfungen.",
  "gallery.priority.tooltip":
    "Geordnete operative Orientierung basierend auf Integrität, Verifikation, Wertsignalen, Marktkontext und Aktualität.",
  "gallery.priority.title": "Prioritätswarteschlange",
  "gallery.priority.immediate": "Sofort",
  "gallery.priority.high": "Hoch",
  "gallery.priority.standard": "Standard",
  "gallery.priority.low": "Niedrig",
  "gallery.participation.descIntro":
    "Jedes Werk unten ist ein kanonischer Eintrag in der Akte mit der Kontinuitätsschicht Ihrer Institution.",
  "gallery.participation.descMiddle":
    "Künstlerattestierung kann vertieft werden, wenn der Künstler die Urheberschaft authentifiziert.",
  "gallery.participation.descOutro":
    "Der Eintrag ist vollständig; Schichten sammeln sich an.",
  "gallery.participation.title": "Attestierungen können vertieft werden",
  "gallery.participation.record": "Eintrag",
  "gallery.participation.records": "Einträge",
  "gallery.participation.inviteAuthenticate": "Zur Authentifizierung einladen",
  "gallery.participation.untitledWork": "Werk ohne Titel",
  "gallery.participation.noImage": "Kein Bild",
  "gallery.participation.associatedArtist": "Zugeordneter Künstler",
  "gallery.participation.institutionLayer": " · Institutionsschicht {when}",
  "gallery.participation.publicRecord": "Öffentlicher Eintrag",
  "gallery.status.ready": "Bereit",
  "gallery.status.needsAttention": "Aufmerksamkeit nötig",
  "gallery.status.incomplete": "Unvollständig",
  "gallery.status.complete": "Vollständig",
  "gallery.invitations.hubDesc":
    "Zwei Kontinuitätskanäle: allgemeine Repräsentation und werksspezifische Authentifizierung. Der kanonische Eintrag existiert unabhängig; Einladungen vertiefen Teilnehmerattestierungen.",
  "gallery.invitations.tabRepresentation": "Repräsentation",
  "gallery.invitations.tabArtworkAuth": "Werkauthentifizierung",
  "gallery.invitations.tabListLabel": "Einladungstyp",
  "gallery.invitations.sectionTooltip":
    "Laden Sie Künstler ein, Einträge zu authentifizieren, die mit ihrer Praxis verbunden sind. Der kanonische Werk-Eintrag existiert unabhängig; Einladungen vertiefen Teilnehmerattestierungen, keine Galerie-Genehmigungsworkflows.",
  "gallery.invitations.sendRepresentationLabel": "Repräsentationseinladung senden",
  "gallery.invitations.artistEmail": "Künstler-E-Mail",
  "gallery.invitations.emailPlaceholder": "kuenstler@beispiel.de",
  "gallery.invitations.sentAs": "Gesendet als:",
  "gallery.invitations.representationBody":
    "Der Künstler erhält eine formelle Einladung, Einträge in der Akte unter Bezug auf Ihre Institution zu prüfen und zu bestätigen.",
  "gallery.invitations.duplicatePending":
    "Für diese Adresse liegt bereits eine ausstehende Einladung vor.",
  "gallery.invitations.resend": "Einladung erneut senden",
  "gallery.invitations.adminOnly": "Nur Administratoren können Einladungen senden.",
  "gallery.invitations.noneSent": "Es wurden noch keine Einladungen gesendet.",
  "gallery.invitations.colArtist": "Künstler",
  "gallery.invitations.colStatus": "Status",
  "gallery.invitations.colSentDate": "Sendedatum",
  "gallery.invitations.colActions": "Aktionen",
  "gallery.invitations.statusDeclined": "Abgelehnt",
  "gallery.invitations.copyInviteLink": "Einladungslink kopieren",
  "gallery.invitations.copied": "Kopiert",
  "gallery.invitations.publishing": "Wird veröffentlicht…",
  "gallery.invitations.publish": "Veröffentlichen",
  "gallery.invitations.manualDraftHint":
    "Wenn die Einladungs-E-Mail nicht gesendet werden konnte, können Sie einen Entwurf kopieren.",
  "gallery.invitations.copyDraft": "Entwurf kopieren",
  "gallery.invitations.representationSectionTitle": "Repräsentationseinladungen",
  "gallery.invitations.representationSectionDesc":
    "Laden Sie Künstler ein, sich allgemein Ihrer Institution anzuschließen — getrennt von werksspezifischer Authentifizierung.",
  "gallery.artworkAuth.sectionTitle": "Werkauthentifizierungseinladungen",
  "gallery.artworkAuth.sectionDescIntro":
    "Kontinuitätsverlauf für bestimmte kanonische Einträge.",
  "gallery.artworkAuth.emptyBody":
    "Noch keine Werkauthentifizierungseinladungen. Unter Werke {cta} bei einem registrierten Eintrag verwenden.",
  "gallery.artworkAuth.sentPrefix": "Gesendet",
  "gallery.artworkAuth.resend": "Erneut senden",
  "gallery.artworkAuth.copyLink": "Link kopieren",
  "gallery.artworkAuth.statusAuthenticated": "Urheberschaft authentifiziert",
  "gallery.artworkAuth.statusWithdrawn": "Zurückgezogen",
  "gallery.artworkAuth.statusExpired": "Abgelaufen",
  "gallery.artworkAuth.statusAwaiting": "Authentifizierung ausstehend",
  "gallery.artworkAuth.modalTitle": "Künstler zur Authentifizierung einladen",
  "gallery.artworkAuth.modalLead":
    "Dieser Werk-Eintrag ist bereits im Register in der Akte. Laden Sie den Künstler ein, die Urheberschaft zu authentifizieren, die Chronologie zu vertiefen und künstlerische Details beizutragen.",
  "gallery.artworkAuth.modalOutcome":
    "Der Künstler erhält eine Kontinuitätseinladung, die speziell mit diesem Werk verknüpft ist.",
  "gallery.artworkAuth.ctaSend": "Kontinuitätseinladung senden",
  "gallery.artworkAuth.artistOnFile": "Künstler in der Akte:",
  "gallery.artworkAuth.institutionContinuityPending": "Institutionelle Kontinuität ausstehend",
  "gallery.artworkAuth.personalNote": "Persönliche Notiz (optional)",
  "gallery.artworkAuth.notePlaceholder":
    "Eine kurze Kontinuitätsnotiz. Archivton, keine Genehmigungsanfrage.",
  "gallery.artworkAuth.adminOnlyError":
    "Nur Galerieadministratoren können Werkauthentifizierungseinladungen senden.",
  "gallery.artworkAuth.invalidEmail": "Geben Sie eine gültige Künstler-E-Mail ein.",
  "gallery.artworkAuth.sendFailed": "Einladung konnte nicht gesendet werden.",
  "gallery.artworkAuth.networkError": "Netzwerkfehler. Bitte erneut versuchen.",
  "gallery.artworkAuth.inviteOnFile": "Einladung in der Akte für {email}.",
  "gallery.artworkAuth.inviteSent": "Kontinuitätseinladung gesendet an {email}.",
  "gallery.artworkAuth.close": "Schließen",
  "gallery.toast.loadMembershipFailed": "Galerie-Mitgliedschaft konnte nicht geladen werden.",
  "gallery.toast.requestIncomplete": "Anfrage nicht abgeschlossen ({status}).",
  "gallery.toast.inviteRecordAdminOnly":
    "Nur Galerieadministratoren können Einladungen erfassen.",
  "gallery.toast.inviteDuplicateOnFile":
    "Für diese Adresse liegt bereits eine Einladung in der Akte vor.",
  "gallery.toast.inviteOnFileWithDetail": "In der Akte für {email}. {detail}",
  "gallery.toast.inviteSentTo": "Einladung in der Akte. Kopie gesendet an {email}.",
  "gallery.toast.inviteRecordedNoEmail":
    "Erfasst für {email}. E-Mail nicht gesendet; kopieren Sie den manuellen Entwurf oder passen Sie die Mail-Einstellungen an.",
  "gallery.toast.inviteResentSignupLink":
    "Einladung erneut in der Akte. Neuer Registrierungslink an den Künstler gesendet.",
  "gallery.toast.inviteLinkRefreshedNoEmail":
    "Einladungslink in der Akte aktualisiert. E-Mail nicht gesendet; Link aus der Zeile kopieren.",
  "gallery.toast.inviteVisibilityPublic":
    "Sichtbarkeit aktualisiert. Der Künstler ist jetzt öffentlich auf Ihrer Institutionsseite.",
  "gallery.toast.couldNotPublish": "Veröffentlichung fehlgeschlagen ({status}).",
  "gallery.toast.couldNotResend": "Erneutes Senden fehlgeschlagen ({status}).",
  "gallery.toast.artworkAuthResent": "Werkauthentifizierungseinladung erneut gesendet.",
  "gallery.toast.artworkAuthRefreshedNoEmail":
    "Einladung in der Akte aktualisiert; E-Mail nicht gesendet.",
  "gallery.toast.copyFailed": "Kopieren fehlgeschlagen. Text manuell auswählen.",
  "gallery.toast.imageRequired":
    "Bild ist erforderlich, um den kanonischen Eintrag in der Akte zu öffnen.",
  "gallery.toast.artistNameRequired":
    "Künstlername ist erforderlich, wenn kein Roster-Künstler verknüpft ist.",
  "gallery.toast.registerFailedDetail":
    "Werk konnte nicht in der Akte registriert werden. Berechtigungen, Pflichtfelder und Katalog-Migrationen prüfen.",
  "gallery.toast.profileAdminOnly":
    "Nur Galerieadministratoren können die institutionelle Präsenz bearbeiten.",
  "gallery.toast.profileSaveFailed": "Änderungen konnten nicht eingereicht werden.",
  "gallery.toast.verifyFailed": "Verifikation nicht abgeschlossen.",
  "gallery.toast.verifySuccess":
    "Attestierung erfasst. Dieses Werk ist jetzt im Register verifiziert.",
  "gallery.toast.certificateFailed": "Zertifikat konnte nicht eingereicht werden.",
  "gallery.toast.certificateFiled": "Zertifikat für dieses Werk eingereicht.",
  "gallery.toast.certificateAlreadyOnFile":
    "Zertifikat bereits in der Akte für dieses Werk.",
  "gallery.toast.certificateRetryFailed":
    "Zertifikat konnte nicht eingereicht werden. Erneut versuchen.",
  "gallery.toast.representationEndedFull":
    "Repräsentation in der Akte beendet. Frühere Einreichungen bleiben in der Chronologie sichtbar.",
  "gallery.toast.latestActivity": "Letzte Aktivität: {title}",
  "gallery.toast.latestActivityWhen": "Letzte Aktivität: {title} · {when}",
  "gallery.toast.registerRequestFailed": "Anfrage fehlgeschlagen.",
  "gallery.artworkAuth.review.loading": "Eintragsprüfung wird geladen…",
  "gallery.artworkAuth.review.loadFailed":
    "Diese Eintragsprüfung konnte nicht geladen werden. Bitte Link erneut versuchen.",
  "gallery.artworkAuth.review.missingLink":
    "Prüflink fehlt. Seite über Einladungs-E-Mail oder Künstlerstudio öffnen.",
  "gallery.artworkAuth.review.loadFailedHint":
    "Der Einladungslink ist möglicherweise abgelaufen oder der Eintrag wurde verschoben. Link erneut versuchen oder Institution kontaktieren.",
  "gallery.artworkAuth.review.joinRegistry": "Register beitreten",
  "gallery.artworkAuth.review.signIn": "Anmelden",
  "gallery.artworkAuth.review.joinPrompt":
    "Wenn Sie Künstler sind und dem Register beitreten möchten, können Sie ein Konto erstellen oder sich anmelden.",
  "gallery.artworkAuth.review.authFailed":
    "Urheberschaft konnte nicht in der Akte authentifiziert werden.",
  "gallery.artworkAuth.review.wrongEmail":
    "Diese Einladung wurde an eine andere E-Mail-Adresse gesendet. Mit der eingeladenen Adresse anmelden oder Institution um erneutes Senden bitten.",
  "gallery.artworkAuth.review.notAuthorized":
    "Ihr Konto entspricht nicht dem Künstler in diesem Eintrag. Mit der eingeladenen E-Mail anmelden oder Institution kontaktieren.",
  "gallery.artworkAuth.review.contributeFailed": "Beitrag konnte nicht eingereicht werden.",
  "gallery.artworkAuth.review.withdrawn":
    "Diese Kontinuitätseinladung wurde zurückgezogen. Die Institution kann bei Bedarf eine neue Einladung senden.",
  "gallery.artworkAuth.review.expired":
    "Dieser Einladungslink ist abgelaufen. Die Institution kann eine neue Einladung senden.",
  "gallery.artworkAuth.review.unavailable":
    "Diese Eintragsprüfung ist nicht verfügbar. Möglicherweise bereits authentifiziert oder Link geändert.",
  "gallery.artworkAuth.review.authenticatedTitle":
    "Urheberschaft in der Akte authentifiziert",
  "gallery.artworkAuth.review.authenticatedBody":
    "Sie können die Chronologie mit einem archivischen Urheberschaftsbeitrag vertiefen.",
  "gallery.artworkAuth.review.viewPublicRecord": "Öffentlichen Eintrag ansehen",
  "gallery.artworkAuth.review.contributeAuthorship": "Urheberschaft beitragen",
  "gallery.artworkAuth.review.artistStudio": "Künstlerstudio",
  "gallery.artworkAuth.review.openPublicRecord": "Öffentlichen Eintrag öffnen",
  "gallery.artworkAuth.review.openPublicRecordHint":
    "in neuem Tab für vollständigen Chronologiekontext.",
  "gallery.artworkAuth.review.signInPrompt":
    "Register beitreten oder als {email} anmelden, um Urheberschaft zu authentifizieren und den Eintrag zu vertiefen.",
  "gallery.artworkAuth.review.signInPromptGeneric":
    "Register beitreten oder anmelden, um Urheberschaft zu authentifizieren und den Eintrag zu vertiefen.",
  "gallery.artworkAuth.review.joinToReview": "Beitreten zur Prüfung",
  "gallery.artworkAuth.review.authenticateCta": "Urheberschaft in der Akte authentifizieren",
  "gallery.artworkAuth.review.viewRecordFirst": "Zuerst öffentlichen Eintrag ansehen",
  "gallery.artworkAuth.review.cardTooltip":
    "Ein Werk Ihrer Praxis ist im Register in der Akte. Prüfen Sie den Eintrag und authentifizieren Sie die Urheberschaft.",
  "gallery.artworkAuth.review.workOnFile": "Werk in der Akte",
  "gallery.artworkAuth.review.institutionLabel": "Institution in der Akte",
  "gallery.artworkAuth.review.artistLabel": "Künstler in der Akte",
  "gallery.artworkAuth.review.personalMessage": "Persönliche Nachricht der Institution",
  "gallery.artworkAuth.review.joinPlatformPrompt":
    "Dem Register beitreten, um Urheberschaft zu authentifizieren und den dokumentarischen Eintrag zu vertiefen.",
  "gallery.ops.reason.registryIdMissing": "Registrierungs-ID fehlt",
  "gallery.ops.reason.noArtistLinked": "Kein Künstler verknüpft",
  "gallery.ops.reason.noOwnership": "Kein Eigentum in der Akte",
  "gallery.ops.reason.noOwnershipHistory": "Keine Eigentumshistorie in der Akte",
  "gallery.ops.reason.ownershipLedgerMismatch":
    "Eigentumsbuch stimmt nicht mit aktuellem Eigentümer überein",
  "gallery.ops.reason.titleMissing": "Titel fehlt",
  "gallery.ops.reason.metadataFingerprintMissing": "Metadaten-Fingerabdruck fehlt",
  "gallery.ops.reason.missingDeclaredValue": "Deklarierter Wert fehlt",
  "gallery.ops.reason.missingImage": "Bild fehlt",
  "gallery.ops.reason.incompleteMetadata": "Unvollständige Metadaten (Jahr / Medium)",
  "gallery.ops.reason.certificateRevoked": "Zertifikat widerrufen",
  "gallery.ops.reason.missingVerification": "Verifizierung fehlt",
  "gallery.ops.reason.noCertificateOnFile": "Kein Zertifikat in der Akte",
  "gallery.ops.reason.listedWithoutVerification":
    "Am Markt gelistet ohne Verifizierung",
  "gallery.ops.reason.listedWithoutCertificate":
    "Am Markt gelistet ohne Zertifikat",
  "gallery.ops.reason.noDeclaredValueOnFile": "Kein deklarierter Wert in der Akte",
  "gallery.ops.reason.highDeclaredValue": "Hoher deklarierter Wert",
  "gallery.ops.reason.materialDeclaredValue": "Erheblicher deklarierter Wert",
  "gallery.ops.reason.verifiedWithoutCertificate": "Verifiziert ohne Zertifikat",
  "gallery.ops.reason.noVerificationSignals": "Keine Verifizierungssignale",
  "gallery.ops.reason.certifiedRecord": "Zertifizierter Eintrag",
  "gallery.ops.reason.recentActivity": "Kürzliche Aktivität",
  "gallery.ops.reason.oldIncomplete": "Alter Eintrag noch unvollständig",
  "gallery.ops.reason.highValueNoCertificate": "Hoher Wert ohne Zertifikat",
  "gallery.ops.action.assignArtist": "Künstler zuweisen",
  "gallery.ops.action.viewRecord": "Eintrag ansehen",
  "gallery.ops.action.completeDetails": "Details vervollständigen",
  "gallery.ops.action.addValue": "Wert hinzufügen",
  "gallery.ops.action.verifyRecord": "Eintrag verifizieren",
  "gallery.ops.action.issueCertificate": "Zertifikat ausstellen",
  "gallery.ops.recommended.noAction": "Keine Maßnahme erforderlich",
  "gallery.ops.recommended.reviewRecord": "Eintrag prüfen",
  "gallery.api.invalidJson": "Ungültiges JSON",
  "gallery.api.invalidBody": "Ungültiger Body",
  "gallery.api.unauthorized": "Nicht autorisiert",
  "gallery.api.missingGalleryId": "gallery_id fehlt",
  "gallery.api.invalidArtistEmail": "Ungültige artist_email",
  "gallery.api.inviteAdminOnly":
    "Nur Galerie-Administratoren können Einladungen senden.",
  "gallery.api.resendAdminOnly":
    "Nur Galerie-Administratoren können Einladungen erneut senden.",
  "gallery.api.couldNotLoadGallery": "Galerie konnte nicht geladen werden.",
  "gallery.api.galleryNotFound": "Galerie nicht gefunden.",
  "gallery.api.couldNotVerifyInviteState":
    "Einladungsstatus konnte nicht geprüft werden.",
  "gallery.api.alreadyInvited": "Dieser Künstler wurde bereits eingeladen.",
  "gallery.api.couldNotRecordInvite": "Einladung konnte nicht gespeichert werden.",
  "gallery.api.missingInviteId": "invite_id oder inviteId fehlt.",
  "gallery.api.inviteNotFound": "Einladung nicht gefunden.",
  "gallery.api.inviteNotPending":
    "Nur ausstehende Einladungen können erneut ausgestellt werden.",
  "gallery.api.missingArtworkId": "artwork_id fehlt",
  "gallery.api.artworkNotFound": "Werk nicht gefunden",
  "gallery.api.noInstitutionContext":
    "Dieses Werk hat keinen institutionellen Ablagekontext.",
  "gallery.api.emailCreatedFailed":
    "Einladung gespeichert. E-Mail nicht gesendet; Link ggf. aus der Zeile kopieren.",
  "gallery.api.emailUpdatedFailed":
    "Einladungslink aktualisiert. E-Mail nicht gesendet; Link ggf. aus der Zeile kopieren.",
  "gallery.api.notAuthorisedInstitution": "Für diese Institution nicht berechtigt",
  "gallery.api.artworkAuthDuplicatePending":
    "Für diese Adresse und dieses Werk existiert bereits eine ausstehende Authentifizierungseinladung.",
  "gallery.api.artworkAuthAlreadyCompleted":
    "Diese Einladung ist bereits in der Akte abgeschlossen.",
  "gallery.inviteDraft.subject":
    "{galleryName} hat Sie eingeladen, dem RROWM Register beizutreten",
  "gallery.inviteDraft.to": "An: {email}",
  "gallery.inviteDraft.bodyIntro":
    "{galleryName} hat Sie eingeladen, dem RROWM Register als vertretener Künstler beizutreten.",
  "gallery.inviteDraft.acceptLine1":
    "Zum Annehmen den personalisierten Link aus der Register-E-Mail verwenden (Einmal-Token).",
  "gallery.inviteDraft.acceptLine2":
    "Registrierung nur mit genau dieser eingeladenen Adresse.",
  "gallery.inviteDraft.registrySignup":
    "Register-Anmeldung: {site}/signup?invite_token=<aus-register-e-mail-einfügen>",
  "gallery.inviteDraft.galleryPage": "Galerieseite: {url}",
  "gallery.inviteDraft.galleryPagePlaceholder":
    "Galerieseite: {site}/gallery/<gallery-slug>",
  "gallery.inviteDraft.afterOnboarding":
    "Nach Abschluss des Künstler-Onboardings ist Ihre Einladung bestätigt; Ihre Galerie kann benachrichtigt werden.",
  "gallery.email.artistInvite.subject": "{galleryName} · Einträge in der Akte authentifizieren",
  "gallery.email.artistInvite.preheader":
    "Mit Ihrer Praxis verbundene Einträge authentifizieren und vertiefen",
  "gallery.email.artistInvite.kicker": "Kanonischer Eintrag · Teilnehmerattestierung",
  "gallery.email.artistInvite.body1":
    "{galleryName} nimmt an der Chronologie in der Akte für mit Ihrer Praxis verbundene Werke teil. {inviteRecordExists} Sie sind eingeladen, Urheberschaft zu authentifizieren und den dokumentarischen Eintrag zu vertiefen — nicht einen institutionellen Upload zu genehmigen.",
  "gallery.email.artistInvite.body2":
    "Nach dem Beitritt: kanonischen Eintrag prüfen, Urheberschaft authentifizieren, künstlerische Details ergänzen und Kontinuitätsereignisse beitragen. {recordDeepensOverTime}.",
  "gallery.email.artistInvite.body3":
    "Der Link gilt nur für diese Adresse, ist einmalig und läuft gemäß Einladungsdatensatz ab.",
  "gallery.email.artistInvite.cta": "Authentifizieren & beitreten",
  "gallery.email.artistInvite.footnote":
    "Falls nicht für Sie bestimmt, keine Aktion. Link nicht weiterleiten.",
  "gallery.email.artistInvite.textIntro":
    "{galleryName} nimmt an der Chronologie für mit Ihrer Praxis verbundene Werke teil.",
  "gallery.email.artistInvite.textLink": "Authentifizieren & beitreten (Einmal-Link):",
  "gallery.email.artistInvite.textRegister":
    "Registrierung nur mit dieser E-Mail: {email}",
  "gallery.email.artistInvite.textDisregard":
    "Falls diese Nachricht irrtümlich gesendet wurde, ignorieren Sie sie.",
  "gallery.email.artworkAuth.subject":
    "Kunstwerkeintrag in der Akte authentifizieren · {title}",
  "gallery.email.artworkAuth.preheader":
    "Kanonischen Kunstwerkeintrag prüfen, authentifizieren und vertiefen.",
  "gallery.email.artworkAuth.kicker": "Kunstwerkeintrag · Kontinuitätseinladung",
  "gallery.email.artworkAuth.body1":
    "Ein mit Ihrer Praxis verbundenes Werk ist bereits im Register erfasst.",
  "gallery.email.artworkAuth.body2":
    "{title}{registryLine}Mit Kontinuitätsteilnahme von {galleryName} abgelegt.",
  "gallery.email.artworkAuth.body3":
    "Sie sind eingeladen, zu prüfen, Urheberschaft zu authentifizieren und den dokumentarischen Eintrag zu vertiefen. {recordDeepensOverTime}. Dies ist keine Genehmigungsanfrage oder Onboarding-Aufgabe für die Institution.",
  "gallery.email.artworkAuth.noteFrom": "Hinweis von {galleryName}:",
  "gallery.email.artworkAuth.body4":
    "Der Link gilt nur für diese Adresse und läuft gemäß Einladungsdatensatz ab.",
  "gallery.email.artworkAuth.cta": "Kunstwerkeintrag prüfen",
  "gallery.email.artworkAuth.footnote":
    "Falls nicht für Sie bestimmt, keine Aktion. Link nicht weiterleiten.",
  "gallery.email.fallback.institution": "Eine Institution",
  "gallery.email.fallback.artwork": "Werk in der Akte",
  "gallery.email.fallback.gallery": "Galerie",
  "representation.publicParticipationOnFile": "Öffentliche Teilnahme in der Akte",
  "representation.artistAttestationOnFile": "Künstlerattestierung in der Akte",
  "representation.artistAttestationMayDeepen": "Künstlerattestierung kann vertieft werden",
  "pricing.eyebrow": "Organisations-Studio · kostenpflichtig",
  "pricing.title": "Wählen Sie, wie Ihr Organisations-Studio RROWM nutzt",
  "pricing.pro.title": "Organisation Professional",
  "pricing.pro.continue": "Weiter zur Registrierung",
  "pricing.enterprise.title": "Institutional Enterprise",
  "pricing.enterprise.contact": "Register kontaktieren",
  "about.principles.title": "Ein Register für Vertrauen",
  "about.tabs.what": "Was es ist",
  "about.tabs.how": "Wie es funktioniert",
  "about.tabs.visibility": "Sichtbarkeit",
  "about.tabs.properties": "Eigenschaften",
  "about.tabs.who": "Für wen",
  "about.what.title": "Was das Register ist",
  "about.how.title": "Wie es funktioniert",
  "about.visibility.title": "Öffentliche Akte, private Details",
  "about.properties.title": "Systemeigenschaften",
  "about.audience.title": "Für wen es gedacht ist",
  "collector.nav.workspace": "Studio",
  "collector.nav.works": "Werke",
  "collector.nav.attention": "Aufmerksamkeit",
  "collector.shell.publicCollection": "Öffentliche Sammlung",
  "collector.shell.publicListingsNote":
    "Öffentliche Listings zeigen nur Werke mit verifizierter Eigentumsführung.",
  "collector.shell.loading": "Wird geladen…",
  "collector.hero.fallbackCollection": "Ihre Sammlung",
  "collector.hero.tooltip":
    "Ein ruhiger Raum für das, was Sie halten. Eigentumsstatus, Aufmerksamkeitspunkte und Historie — ohne Katalog-Marketing.",
  "collector.hero.ownershipOnRecord": "Eigentum in der Akte",
  "collector.hero.viewWorks": "Werke ansehen",
  "collector.hero.inStewardship": "In Ihrem Studio",
  "collector.hero.studioSince": "Studio seit {year}",
  "collector.hero.work": "Werk",
  "collector.hero.works": "Werke",
  "collector.hero.verifiedOwnership": "Verifiziertes Eigentum",
  "collector.hero.privateByDefault": "Standardmäßig privat",
  "collector.hero.accountPresence": "Konto & Präsenz",
  "collector.hero.profile": "Profil",
  "collector.hero.on": "An",
  "collector.hero.off": "Aus",
  "collector.hero.publicPageAvailable": "Öffentliche Sammlungsseite ist verfügbar.",
  "collector.hero.workspacePrivate": "Kein öffentliches Profil. Das Studio bleibt privat.",
  "collector.hero.anonymousLabel": "Anonymes Label",
  "collector.hero.nameShown": "Name sichtbar",
  "collector.hero.continuity": "Kontinuität",
  "collector.hero.openAttention": "Aufmerksamkeit öffnen ({count})",
  "collector.hero.nothingNeedsAttention": "Nichts erfordert Aufmerksamkeit",
  "collector.hero.item": "Punkt",
  "collector.hero.items": "Punkte",
  "collector.hero.attentionLabel": "Übertragungen, Ansprüche & Verifizierung",
  "collector.hero.actionSuggested": "Handlung empfohlen",
  "collector.hero.allClear": "Alles in Ordnung",
  "collector.hero.publicCollection": "Öffentliche Sammlung",
  "collector.hero.publicPageWhenSlug": "Öffentliche Seite, sobald Slug verfügbar",
  "collector.hero.registry": "Register",
  "collector.hero.previewEmpty":
    "Gehaltene Werke erscheinen hier mit Bildern, wenn die Akten sie enthalten.",
  "collector.hero.previewNoImages":
    "Bilder erscheinen, wenn Werke Kunstwerkbilder enthalten.",
  "collector.overview.srOnly": "Sammlungsübersicht",
  "collector.overview.empty":
    "Noch keine gehaltenen Werke. Wenn Sie Eigentum beanspruchen oder erhalten, erscheinen sie hier.",
  "collector.overview.held": "{count} {units} gehalten.",
  "collector.overview.verifiedOwnership":
    "{count} verifizierte Eigentums-{units}.",
  "collector.overview.pendingTransfer": "{count} ausstehende {units}.",
  "collector.overview.notVerified":
    "{count} Eigentums-{units} noch nicht verifiziert.",
  "collector.overview.openClaims": "{count} offene Eigentums-{units}.",
  "collector.overview.withCertificate":
    "{count} {units} mit Zertifikat in der Akte.",
  "collector.word.work": "Werk",
  "collector.word.works": "Werke",
  "collector.word.record": "Eintrag",
  "collector.word.records": "Einträge",
  "collector.word.transfer": "Übertragung",
  "collector.word.transfers": "Übertragungen",
  "collector.word.claim": "Anspruch",
  "collector.word.claims": "Ansprüche",
  "collector.works.title": "Werke",
  "collector.works.order": "Reihenfolge:",
  "collector.works.sortRecency": "Aktualität",
  "collector.works.sortValue": "Deklarierter Wert",
  "collector.works.emptyPrefix": "Beanspruchen Sie Eigentum über das",
  "collector.works.emptyLink": "Register",
  "collector.works.emptySuffix": "um diese Liste aufzubauen.",
  "collector.works.transferPending": "Übertragung ausstehend",
  "collector.works.verificationOutstanding": "Verifizierung ausstehend",
  "collector.attention.title": "Erfordert Aufmerksamkeit",
  "collector.attention.empty": "Derzeit ist keine Handlung nötig.",
  "collector.attention.verificationPending":
    "Eigentumsverifizierung ausstehend: {title}",
  "collector.attention.transferResolve": "Zu lösende Übertragung: {title}",
  "collector.attention.claimInProgress": "Eigentumsanspruch läuft: {title}",
  "collector.fallback.collector": "Sammler",
  "collector.fallback.artist": "Künstler",
  "collector.fallback.untitled": "Ohne Titel",
  "collector.fallback.work": "Werk",
  "collector.activity.emptyHold":
    "Aktivität erscheint, sobald Sie Werke halten.",
  "collector.activity.loading": "Wird geladen…",
  "collector.activity.noEvents":
    "Keine jüngeren Ereignisse in Ihrer Sammlung.",
  "collector.activity.saleTransferPending": "Verkauf: Übertragung ausstehend",
  "collector.activity.valueRecorded": "Wert erfasst",
  "collector.activity.ownershipClaim": "Eigentumsanspruch",
  "collector.activity.ownershipUpdate": "Eigentumsaktualisierung",
  "collector.activity.verification": "Verifizierung",
  "collector.activity.untitledWork": "Werk ohne Titel",
  "collector.activity.detail": "{title} · {kind}",
  "collector.activity.detailWithStatus": "{title} · {kind} · {status}",
  "provenance.empty": "Noch keine Chronologie-Meilensteine in der Akte.",
  "provenance.chronology": "Chronologie",
  "provenance.fullChronology": "Vollständige Chronologie",
  "provenance.currentRecord": "Aktueller Stand",
  "provenance.completeness.high": "Mehrschichtige Akte",
  "provenance.completeness.moderate": "Wachsende Akte",
  "provenance.completeness.limited": "Eröffnungsakte",
  "provenance.insight.noVerification": "Für dieses Werk liegen keine Verifikationssignale vor.",
  "provenance.insight.ownershipUnverified": "Aktuelles Eigentum ist nicht verifiziert.",
  "provenance.insight.saleIncomplete":
    "Verkauf erfasst. Eigentumsübertragung unvollständig.",
  "provenance.insight.fullyVerified": "Vollständig verifizierter Eintrag.",
  "provenance.insight.noRecentActivity": "Keine kürzliche Aktivität erfasst.",
  "about.journey.recordTitle": "Erfassen",
  "about.journey.recordSubtitle": "Eine eindeutige Register-Identität pro Werk",
  "about.journey.verifyTitle": "Verifizieren",
  "about.journey.verifySubtitle": "Kryptografischer Nachweis und unveränderliche Zeitstempel",
  "about.journey.certifyTitle": "Zertifizieren",
  "about.journey.certifySubtitle": "Authentizitätsdokumente am Eintrag",
  "about.journey.traceTitle": "Nachverfolgen",
  "about.journey.traceSubtitle": "Eigentums- und Wertgeschichte über die Zeit",
  "about.journey.then": "dann",
  "provenance.event.registration": "Werk im Register erfasst",
  "provenance.event.institutional": "Institutionelle Beziehung erfasst",
  "provenance.event.custody": "Custody in der Chronologie reflektiert",
  "provenance.chronologyIntro":
    "Einträge sammeln sich; spätere Einreichungen stehen neben früheren. Mehrere Teilnehmende erscheinen, wenn Bestätigungen und Custody-Schritte dokumentiert werden.",
  "provenance.howFileReads": "Wie die Akte liest",
  "provenance.continuityMarkers": "Kontinuitätsmarker",
  "provenance.supportingMaterial": "Belegmaterial angehängt",
  "provenance.certificateOnFile": "Zertifikat in der Akte",
  "studio.search.byTitle": "Nach Titel suchen…",
  "studio.search.artworks": "Werke suchen…",
  "studio.search.certificates": "Zertifikate suchen…",
  "studio.filter.artworks": "Werke filtern",
  "studio.filter.certificates": "Zertifikate filtern",
  "studio.filter.ownership": "Eigentumseinträge filtern",
  "studio.filter.verifiedOnly": "Nur verifiziert",
  "studio.filter.notVerified": "Nicht verifiziert",
  "studio.filter.withDeclaredValue": "Mit deklariertem Wert",
  "studio.filter.noDeclaredValue": "Ohne deklarierten Wert",
  "studio.registerArtwork": "Werk registrieren",
  "studio.artworks.noMatches": "Keine Werke entsprechen Suche oder Filter.",
  "studio.artworks.verified": "Verifiziert",
  "studio.artworks.notVerified": "Nicht verifiziert",
  "studio.artworks.verifiedTooltip": "Im Eintrag verifiziert.",
  "studio.artworks.recordValue": "Wert erfassen",
  "studio.artworks.noRecordId": "Keine Register-ID",
  "studio.artworks.emptyLabel": "Ihr Studio",
  "studio.artworks.emptyTitle": "Noch keine vertretenen Werke in der Akte",
  "studio.certificates.all": "Alle Zertifikate",
  "studio.certificates.withImage": "Mit Werkabbildung",
  "studio.certificates.withoutImage": "Ohne Abbildung",
  "studio.certificates.noMatches": "Keine Zertifikate entsprechen Suche oder Filter.",
  "studio.certificates.imagePlaceholder": "Registereintrag",
  "studio.certificates.registryCertificate": "Registerzertifikat",
  "studio.certificates.open": "Öffnen →",
  "studio.certificates.emptyLabel": "Registerzertifikate",
  "studio.certificates.emptyTitle": "Noch keine verifizierten Zertifikate",
  "studio.ownership.filterAll": "Alle Einträge ({count})",
  "studio.ownership.filterNeedsTransfer": "Übertragung nötig ({count})",
  "studio.ownership.filterSold": "Verkauft ({count})",
  "studio.ownership.filterHeldByYou": "In Ihrer Obhut ({count})",
  "studio.ownership.noMatches": "Keine Eigentumseinträge entsprechen Suche oder Filter.",
  "studio.ownership.noTransfers": "Noch keine Übertragungen",
  "studio.ownership.transferLedger": "{count} Übertragung im Ledger",
  "studio.ownership.transferLedgerPlural": "{count} Übertragungen im Ledger",
  "studio.ownership.you": "Sie",
  "studio.ownership.unassigned": "Nicht zugewiesen",
  "studio.ownership.collectorId": "Sammler ({id}…)",
  "studio.ownership.saleLogged": "Verkauf erfasst: Übertragung abschließen",
  "studio.ownership.lastEventSale": "Letztes Ereignis · Verkauf",
  "studio.ownership.inYourCustody": "In Ihrer Obhut",
  "studio.ownership.currentHolder": "Aktueller Inhaber",
  "studio.ownership.chainDepth": "Kettentiefe",
  "studio.ownership.transfersOnRecord": "{count} Übertragung in der Akte",
  "studio.ownership.transfersOnRecordPlural": "{count} Übertragungen in der Akte",
  "studio.ownership.noRegistryId": "Keine Register-ID",
  "studio.ownership.ledgerLink": "Ledger →",
  "studio.ownership.emptyLabel": "Eigentum",
  "studio.ownership.emptyTitle": "Noch keine Eigentumsaktivität",
  "common.cancel": "Abbrechen",
  "common.save": "Speichern",
  "common.saving": "Wird gespeichert…",
  "common.recording": "Wird erfasst…",
  "common.processing": "Wird verarbeitet…",
  "common.approve": "Genehmigen",
  "common.reject": "Ablehnen",
  "common.sending": "Wird gesendet…",
  "common.ending": "Wird beendet…",
  "studio.hero.fallbackArtist": "Künstler",
  "studio.hero.catalogue": "Katalog",
  "studio.hero.openArtworks": "Werke öffnen",
  "studio.hero.registeredInStudio": "Im Studio registriert",
  "studio.hero.work": "Werk",
  "studio.hero.works": "Werke",
  "studio.hero.verifiedBadge": "{count} verifiziert",
  "studio.hero.pricedBadge": "{count} bewertet",
  "studio.hero.recordsToDeepen":
    "{count} Eintrag zur Authentifizierung & Vertiefung in der Akte",
  "studio.hero.recordsToDeepenPlural":
    "{count} Einträge zur Authentifizierung & Vertiefung in der Akte",
  "studio.hero.amendmentNeedsResponse": "{count} Änderung erfordert Ihre Antwort",
  "studio.hero.amendmentsNeedResponse": "{count} Änderungen erfordern Ihre Antwort",
  "studio.hero.recordHealth": "Aktenzustand",
  "studio.hero.certificates": "Zertifikate",
  "studio.hero.verified": "Verifiziert",
  "studio.hero.priced": "Bewertet",
  "studio.hero.publicStudio": "Öffentliches Studio",
  "studio.hero.artistPage": "Künstlerseite",
  "studio.hero.notPublishedYet": "Noch nicht veröffentlicht",
  "studio.hero.viewPublicPage": "Öffentliche Seite ansehen",
  "studio.hero.setupPresence": "Präsenz einrichten",
  "studio.hero.ownershipLedger": "Eigentums-Ledger",
  "studio.hero.previewEmpty":
    "Registrieren Sie ein Werk, um hier eine Katalogvorschau zu sehen.",
  "studio.loading.opening": "Studio wird geöffnet…",
  "studio.form.title": "Titel",
  "studio.form.titleRequired": "Titel *",
  "studio.form.year": "Jahr",
  "studio.form.medium": "Medium",
  "studio.form.dimensions": "Maße",
  "studio.form.description": "Beschreibung",
  "studio.form.visibility": "Sichtbarkeit",
  "studio.form.image": "Bild",
  "studio.form.imageRequired": "Bild *",
  "studio.form.initialAmount": "Anfangsbetrag (optional)",
  "studio.form.currency": "Währung",
  "studio.form.eventType": "Ereignistyp",
  "studio.form.visibilityPrivate": "Privat",
  "studio.form.visibilityGallery": "Galerie",
  "studio.form.visibilityPublic": "Öffentlich",
  "studio.form.visibilityCertificate": "Zertifikat",
  "studio.form.eventInitial": "Initial",
  "studio.form.eventPrimarySale": "Primärverkauf",
  "studio.form.eventSecondarySale": "Sekundärverkauf",
  "studio.form.eventAppraisal": "Schätzung",
  "studio.form.eventInternalEstimate": "Interne Schätzung",
  "studio.register.titleNew": "Neues Werk registrieren",
  "studio.register.titleGallery": "Werk registrieren",
  "studio.register.issueCanonical": "Kanonischen Eintrag ausstellen",
  "studio.register.artistName": "Künstlername",
  "studio.register.asCreditedPlaceholder": "Wie auf dem Werk genannt",
  "studio.register.plainTextHint":
    "Klartext genügt. Ein Künstlerkonto ist nicht erforderlich, um den kanonischen Eintrag zu öffnen.",
  "studio.register.artistEmailOptional": "Künstler-E-Mail (optional)",
  "studio.register.emailInvitePlaceholder":
    "Für eine spätere Einladung zur Authentifizierung & Vertiefung",
  "studio.register.linkRosterOptional": "Mit Roster-Künstler verknüpfen (optional)",
  "studio.register.noAccountLink": "Keine Kontoverknüpfung, nur Name in der Akte",
  "studio.register.placeholderTitle": "Werktitel",
  "studio.register.placeholderYear": "2024",
  "studio.register.placeholderMedium": "Öl auf Leinwand",
  "studio.register.placeholderDimensions": "122 × 91 cm",
  "studio.register.placeholderDescription": "Werk beschreiben…",
  "studio.register.placeholderAmount": "z. B. 50000",
  "studio.artworkDetail.valueHistory": "Wertverlauf",
  "studio.artworkDetail.noValueHistory": "Noch kein Wertverlauf",
  "studio.valueEvent.title": "Wert-Ereignis erfassen",
  "studio.valueEvent.declaredAmount": "Deklarierter Betrag",
  "studio.valueEvent.amountPlaceholder": "Betrag",
  "studio.valueEvent.noteOptional": "Notiz (optional)",
  "studio.valueEvent.notePlaceholder": "Optionaler Kontext",
  "studio.valueEvent.helpAmount":
    "Der Betrag für dieses Ereignis (Bewertung, Verkaufspreis, Schätzung usw.). Entspricht dem, was tatsächlich genannt oder vereinbart wurde.",
  "studio.valueEvent.helpCurrency":
    "ISO-Währung für den Betrag oben. Wählen Sie die Währung der Angabe, keine implizite Umrechnung.",
  "studio.valueEvent.helpEventTypes":
    "Initial: erster Anker. Primärverkauf: erster Verkauf vom Künstler oder Primärmarkt. Sekundärverkauf: Weiterverkauf. Schätzung: formale Bewertung. Interne Schätzung: Studio-Referenzwert.",
  "studio.valueEvent.helpVisibility":
    "Privat: nur Sie im Studio. Galerie: in Galerie-Kontexten. Zertifikat: auf der Zertifikatsebene. Öffentlich: für öffentliche Registerflächen, wenn die Richtlinie es erlaubt.",
  "studio.valueEvent.helpNotes":
    "Optionaler Kontext: Messe, Kanal, Käufertyp, Gutachter oder alles, was die spätere Einordnung erleichtert.",
  "studio.overview.valueCoverage.title": "Wert & Abdeckung",
  "studio.overview.valueCoverage.subtitle":
    "Summen und Vollständigkeit Ihrer Registereinträge.",
  "studio.overview.totalValue": "Gesamtwert",
  "studio.overview.totalValueCurrency": "Gesamtwert ({currency})",
  "studio.overview.noPricedWorks": "Noch keine bewerteten Werke",
  "studio.overview.avgValueCurrency": "Durchschnittswert ({currency})",
  "studio.overview.recordHealth": "Aktenzustand",
  "studio.overview.priced": "Bewertet",
  "studio.overview.pricedHint": "Werke mit deklariertem Wert",
  "studio.overview.verifiedHint": "Im Register verifiziert",
  "studio.overview.locked": "Gesperrt",
  "studio.overview.lockedHint": "Nach Verifizierung unveränderlich",
  "studio.overview.ownershipRequests.title": "Eigentumsanfragen",
  "studio.overview.ownershipRequests.subtitle":
    "Sammler bitten um Anerkennung. Prüfen und antworten.",
  "studio.overview.noPendingClaims":
    "Keine offenen Ansprüche. Wenn ein Sammler einen Anspruch einreicht, erscheint er hier.",
  "studio.overview.pendingReview": "Ausstehende Prüfung",
  "studio.overview.claimant": "Antragsteller",
  "studio.overview.valueProgression.title": "Wertentwicklung",
  "studio.overview.valueProgression.subtitle":
    "Wie sich Werte vom Anfangswert zum aktuellen vergleichbaren Wert entwickeln.",
  "studio.overview.avgChange": "Durchschnittliche Wertänderung",
  "studio.overview.avgChangeHint":
    "Mittlere %-Änderung, wenn Anfangs- und Endwert dieselbe Währung teilen.",
  "studio.overview.worksIncreased": "Werke mit Wertsteigerung",
  "studio.overview.decliningWorks": "Werke mit Wertverlust",
  "studio.overview.noProgressionData": "Noch keine Entwicklungsdaten",
  "studio.overview.valueChange": "Wertänderung",
  "studio.overview.ownershipIntel.title": "Eigentumsanalyse",
  "studio.overview.ownershipIntel.subtitle":
    "Übertragungen, Haltungen und Bewegung in Ihrem Katalog.",
  "studio.overview.totalTransfers": "Übertragungen gesamt",
  "studio.overview.worksYouHold": "Werke in Ihrer Obhut",
  "studio.overview.avgHoldDays": "Ø Haltedauer (Tage)",
  "studio.overview.catalogueHighlights.title": "Katalog-Highlights",
  "studio.overview.catalogueHighlights.subtitle":
    "Herausragende Einträge aus Ihrer Registeraktivität.",
  "studio.overview.mostTransferred": "Am häufigsten übertragen",
  "studio.overview.mostTransferredHint": "Höchste Übertragungszahl.",
  "studio.overview.longestHeld": "Am längsten gehalten",
  "studio.overview.longestHeldHint":
    "Längste Spanne zwischen erster und letzter Übertragung.",
  "studio.overview.fastestAppreciating": "Stärkste Wertsteigerung",
  "studio.overview.fastestAppreciatingHint":
    "Größter %-Gewinn vom Anfangs- zum Endwert (gleiche Währung).",
  "studio.records.noAwaitingAttestation":
    "Keine Einträge warten auf Ihre Bestätigung. Wenn ein kanonischer Eintrag mit Ihrer Praxis verknüpft wird, erscheint er hier zur Authentifizierung und Vertiefung.",
  "studio.records.institutionalRelationship": "Institutionelle Beziehung",
  "studio.records.relationshipOnFile": "Beziehung in der Akte",
  "studio.records.endOnFile": "In der Akte beenden",
  "studio.records.linkedWith": "Verknüpft mit {name}.",
  "studio.records.linkVisibleAfterEnding":
    "Ihr Institutionslink bleibt nach dem Beenden auf früheren Einreichungen sichtbar.",
  "representation.canonicalRecordOnFile": "Kanonischer Werk-Eintrag in der Akte",
  "representation.recordDeepensOverTime":
    "Die Akte vertieft sich, wenn Teilnehmende Beiträge einreichen",
  "representation.institutionAttestationOnFile":
    "Institutionsbezogene Kontinuität in der Akte",
  "representation.priorContributionsRemainVisible":
    "Frühere Beiträge bleiben in der Chronologie sichtbar",
  "representation.historicalInstitutionLayer":
    "Historische institutionelle Beteiligung bleibt in der Akte",
  "representation.inviteRecordExists":
    "Ein kanonischer Eintrag zu Ihrer Praxis ist bereits in der Akte",
  "representation.notApprovalWorkflow":
    "Nur Schichtbeiträge, keine Eigentumsentscheidung oder Institutionsfreigabe",
  "representation.representationOnFile": "Institutionelle Beziehung in der Akte",
  "representation.priorFilingsRemainVisible":
    "Frühere Beiträge bleiben in der Chronologie sichtbar",
  "representation.amendmentPendingReview": "Änderung offen in der Akte",
  "studio.records.deepen.eyebrow": "Kanonische Einträge",
  "studio.records.deepen.title": "Authentifizieren & vertiefen",
  "studio.records.deepen.description":
    "{inviteRecordExists}. {recordDeepensOverTime}. Sie reichen Beiträge ein. Das Werk ist nicht vorläufig und Sie genehmigen keinen Institutions-Upload.",
  "studio.records.deepen.badge": "{count} Eintrag zu vertiefen",
  "studio.records.deepen.badgePlural": "{count} Einträge zu vertiefen",
  "studio.records.deepen.step1":
    "Den kanonischen Eintrag im aktuellen Stand prüfen",
  "studio.records.deepen.step2": "Urheberschaft als Ihre Bestätigung authentifizieren",
  "studio.records.deepen.step3":
    "Einen archivischen Urheberschaftsbeitrag in der Chronologie einreichen",
  "studio.records.deepen.step4":
    "Optional institutionelle Beziehung im Eintrag anerkennen",
  "studio.records.deepen.opened": "Geöffnet {when}",
  "studio.records.deepen.reviewAuthenticate": "Prüfen & authentifizieren",
  "studio.records.deepen.publicRecord": "Öffentlicher Eintrag",
  "studio.records.deepen.contributeAuthorship": "Urheberschaft beitragen",
  "studio.records.deepen.authenticateAuthorship": "Urheberschaft authentifizieren",
  "studio.records.deepen.institution": "Institution",
  "studio.amendments.eyebrow": "Vertretungsänderungen",
  "studio.amendments.title": "Chronik-Aktualisierungen",
  "studio.amendments.description":
    "Vorgeschlagene Katalogverfeinerungen bleiben vorläufig, bis die Gegenseite sie in der Akte annimmt. Frühere Bestätigungen bleiben sichtbar: akkumulative Chronologie, kein Ersatz.",
  "studio.amendments.responseNeeded": "1 Antwort nötig",
  "studio.amendments.responsesNeeded": "{count} Antworten nötig",
  "studio.amendments.newRequest": "Neue Änderungsanfrage",
  "studio.amendments.empty": "Noch keine Änderungsanfragen in der Akte.",
  "studio.amendments.workFallback": "Werk",
  "studio.amendments.institution": "Institution",
  "studio.amendments.representedArtist": "Vertretener Künstler",
  "studio.amendments.roleArtist": "Künstler",
  "studio.amendments.roleInstitution": "Institution",
  "studio.amendments.initiated": "eingeleitet",
  "studio.amendments.statusAccepted": "In der Akte angenommen",
  "studio.amendments.statusDeclined": "Abgelehnt",
  "studio.amendments.statusWithdrawn": "Zurückgezogen",
  "studio.amendments.resolution": "Entscheidung:",
  "studio.amendments.viewPublicRecord": "Öffentlichen Eintrag ansehen",
  "studio.amendments.responseNote": "Antwortnotiz",
  "studio.amendments.responsePlaceholder": "Antwortnotiz (optional)",
  "studio.amendments.acceptOnFile": "In der Akte annehmen",
  "studio.amendments.decline": "Ablehnen",
  "studio.amendments.withdrawRequest": "Anfrage zurückziehen",
  "studio.amendments.modalTitle": "Neue Änderungsanfrage",
  "studio.amendments.chooseWork": "Wählen Sie ein Werk.",
  "studio.amendments.noteRequired":
    "Fügen Sie eine Notiz zur vorgeschlagenen Änderung hinzu.",
  "studio.amendments.noteDescribe":
    "Beschreiben Sie die gewünschte Änderung. Optionale Katalogfelder gelten nur bei Annahme durch die Gegenseite.",
  "studio.amendments.requestFailed": "Anfrage konnte nicht gesendet werden.",
  "studio.amendments.submitRequest": "Anfrage senden",
  "studio.authorship.title": "Eintrag vertiefen",
  "studio.authorship.workFallback": "Werk in der Akte",
  "studio.authorship.statement": "Urheberschaftserklärung",
  "studio.authorship.statementPlaceholder":
    "Wie Sie Urheberschaft für dieses Werk verstehen: Praxis, Intention oder dokumentarischer Kontext…",
  "studio.authorship.chronology": "Chronologie-Beitrag",
  "studio.authorship.chronologyPlaceholder":
    "Daten, Produktionskontext, Ausstellungshistorie oder gewünschte Kontinuität in der Akte…",
  "studio.authorship.filing": "Beitrag wird eingereicht…",
  "studio.authorship.fileContribution": "Beitrag in der Chronologie einreichen",
  "studio.endRepresentation.title": "Vertretung in der Akte beenden",
  "studio.endRepresentation.noteOptional": "Notiz (optional)",
  "studio.endRepresentation.notePlaceholder":
    "z. B. Roster-Wechsel, Vertrag beendet…",
  "studio.endRepresentation.acknowledge":
    "Ich verstehe, dass frühere Institutionseinträge und Chronologieeinträge im öffentlichen Eintrag sichtbar bleiben.",
  "studio.toast.verificationRequestFailed":
    "Verifizierungsanfrage konnte nicht erfasst werden.",
  "studio.toast.verificationRequestRecorded":
    "Verifizierungsanfrage in der Akte erfasst.",
  "studio.toast.sessionEnded":
    "Sitzung beendet. Melden Sie sich erneut an, um fortzufahren.",
  "studio.toast.verificationIncomplete": "Verifizierung nicht abgeschlossen.",
  "studio.toast.custodyVerified": "Custody-Schritt in der Chronologie verifiziert.",
  "studio.toast.connectionInterrupted":
    "Verbindung unterbrochen. Verbinden Sie sich erneut und öffnen Sie das Studio.",
  "studio.toast.contributionFailed": "Beitrag konnte nicht eingereicht werden.",
  "studio.toast.contributionFiled":
    "Urheberschaftsbeitrag in der Chronologie eingereicht.",
  "studio.toast.contributionError": "Beitrag konnte nicht eingereicht werden.",
  "studio.toast.confirmFailed": "Bestätigung fehlgeschlagen.",
  "studio.toast.confirmRecorded": "Bestätigung in der Akte erfasst.",
  "studio.toast.confirmError": "Bestätigung fehlgeschlagen.",
  "studio.toast.amendmentResolveFailed": "Änderung konnte nicht abgeschlossen werden.",
  "studio.toast.amendmentAccepted": "Änderung in der Akte angenommen.",
  "studio.toast.amendmentDeclined": "Änderung in der Akte abgelehnt.",
  "studio.toast.amendmentResolveError": "Änderung konnte nicht abgeschlossen werden.",
  "studio.toast.withdrawFailed": "Zurückziehen fehlgeschlagen.",
  "studio.toast.amendmentWithdrawn": "Änderung in der Akte zurückgezogen.",
  "studio.toast.withdrawError": "Zurückziehen fehlgeschlagen.",
  "studio.toast.endRepresentationFailed":
    "Vertretung konnte nicht beendet werden.",
  "studio.toast.representationEnded": "Vertretung in der Akte beendet.",
  "studio.toast.endRepresentationError":
    "Vertretung konnte nicht beendet werden.",
  "studio.toast.amendmentRequestFiled":
    "Änderungsanfrage in der Chronologie eingereicht.",
  "studio.toast.activityLogFailed":
    "Aktivitätsprotokoll konnte nicht geschrieben werden. Die Aktion kann dennoch in der Akte sein.",
  "studio.toast.claimApproveFailed": "Anspruch konnte nicht genehmigt werden.",
  "studio.toast.custodyLedgerFailed": "Custody-Ledger konnte nicht geöffnet werden.",
  "studio.toast.custodyRowUpdateFailed": "Custody-Zeile konnte nicht aktualisiert werden.",
  "studio.toast.custodyRowRecordFailed": "Custody-Zeile konnte nicht erfasst werden.",
  "studio.toast.claimRecorded": "Eigentumsanspruch in der Chronologie erfasst.",
  "studio.toast.claimWithdrawFailed": "Anspruch konnte nicht zurückgezogen werden.",
  "studio.toast.claimWithdrawn": "Anspruch aus Prüfung zurückgezogen.",
  "studio.toast.registerFailed": "Werk konnte nicht in der Akte registriert werden.",
  "studio.toast.valueFilingFailed": "Wertangabe konnte nicht erfasst werden.",
  "studio.toast.valueEventRecorded": "Wert-Ereignis in der Akte erfasst.",
  "studio.toast.buyerUuidInvalid": "Käufer-Konto-ID muss eine UUID sein.",
  "studio.toast.buyerIdRequired": "Käufer-Konto-ID ist erforderlich.",
  "studio.toast.buyerNameRequired":
    "Käufername ist für diese Einreichung erforderlich.",
  "studio.toast.recordingTransfer": "Übertragung wird in der Akte erfasst…",
  "studio.toast.transferFailed": "Übertragung konnte nicht eingereicht werden: {error}",
  "studio.toast.transferOwnerUpdateFailed":
    "Übertragung erfasst; aktueller Inhaber konnte nicht automatisch aktualisiert werden.",
  "studio.toast.transferContinued":
    "Chronologie für diese Übertragung fortgesetzt.",
  "studio.ledger.saleRecorded": "Verkauf erfasst",
  "studio.ledger.completeTransfer":
    "Schließen Sie die Eigentumsübertragung ab, damit die Provenienz korrekt bleibt.",
  "studio.ledger.recordTransferDetails": "Übertragungsdetails erfassen",
  "studio.ledger.transferDetails": "Übertragungsdetails",
  "studio.ledger.sellerPrefilled": "Verkäufer (vorausgefüllt)",
  "studio.ledger.sellerUserIdPlaceholder": "Verkäufer-Benutzer-ID",
  "studio.ledger.buyer": "Käufer",
  "studio.ledger.externalBuyer": "Externer Käufer",
  "studio.ledger.existingUser": "Bestehender Nutzer",
  "studio.ledger.buyerUserIdPlaceholder": "Käufer-Benutzer-ID (UUID)",
  "studio.ledger.buyerNamePlaceholder": "Käufername",
  "studio.ledger.buyerType.collector": "Sammler",
  "studio.ledger.buyerType.gallery": "Galerie",
  "studio.ledger.buyerType.institution": "Institution",
  "studio.ledger.buyerType.private": "Privat",
  "studio.ledger.buyerType.unknown": "Unbekannt",
  "studio.ledger.externalBuyerNote": "Externe Käufer benötigen kein Konto.",
  "studio.ledger.saleType": "Verkaufsart",
  "studio.ledger.saleTypePrimary": "Primär",
  "studio.ledger.saleTypeSecondary": "Sekundär",
  "studio.ledger.dateOfSale": "Verkaufsdatum",
  "studio.ledger.notes": "Notizen",
  "studio.ledger.notesPlaceholder": "Optionaler Kontext (Rechnung, Ort usw.)",
  "studio.ledger.saveTransfer": "Übertragung speichern",
  "studio.ledger.title": "Eigentums-Ledger",
  "studio.ledger.artworkFallback": "Werk",
  "studio.ledger.valueHistorySubtitle":
    "Jedes deklarierte Wert-Ereignis für dieses Werk.",
  "studio.ledger.noValueEvents": "Noch keine Wert-Ereignisse erfasst.",
  "studio.ledger.noAdditionalContext": "Kein zusätzlicher Kontext",
  "studio.ledger.visibility": "Sichtbarkeit",
  "studio.ledger.ownershipHistory": "Eigentumshistorie",
  "studio.ledger.ownershipHistorySubtitle":
    "Jede Übertragung und Bestätigung für dieses Werk.",
  "studio.ledger.noOwnershipEvents": "Noch keine Eigentums-Ereignisse erfasst.",
  "studio.ledger.currentOwner": "Aktueller Inhaber",
  "studio.ledger.claimedByYou": "Sie haben Eigentum beansprucht",
  "studio.ledger.claimedByOther": "Eigentum von einem anderen Sammler beansprucht",
  "studio.ledger.from": "Von",
  "studio.ledger.requestVerification": "Verifizierung anfordern",
  "studio.ledger.submitting": "Wird eingereicht…",
  "studio.ledger.verifyOwnership": "Eigentum verifizieren",
  "studio.ledger.verifying": "Wird verifiziert…",
  "studio.ledger.integrityNotes": "Integritätshinweise",
  "studio.ledger.integritySubtitle":
    "Anomalien oder besondere Situationen in der Eigentumsreise erscheinen hier.",
  "studio.ledger.noIntegrityData": "Keine Integritätsdaten verfügbar.",
  "studio.ledger.integrityEventOn": "{type} am {date}",
  "studio.ledger.unknownOwner": "Unbekannter Inhaber",
  "studio.ledger.unknown": "Unbekannt",
  "studio.ledger.status.verified": "Im Besitz (verifiziert)",
  "studio.ledger.status.claimed": "Eigentum beansprucht",
  "studio.ledger.status.unassigned": "Nicht zugewiesen",
  "studio.ledger.status.recorded": "Eigentum erfasst",
  "studio.ledger.valueType.sale": "Verkauf erfasst",
  "studio.ledger.valueType.auction": "Auktion erfasst",
  "studio.ledger.transferType.transfer": "Eigentumsübertragung",
  "studio.ledger.transferType.initial": "Anfangseintrag",
  "studio.ledger.transferType.correction": "Eintragsaktualisierung",
  "studio.ledger.transferType.sale": "Verkauf",
  "studio.ledger.confirm.areYouSure": "Möchten Sie wirklich fortfahren?",
  "studio.ledger.confirm.working": "Wird bearbeitet…",
  "studio.ledger.confirm.adminVerify.title": "Diesen Eigentumsschritt verifizieren?",
  "studio.ledger.confirm.adminVerify.body":
    "Sie markieren diese Eigentumsübertragung als verifiziert. Sie bestätigen dem Register, dass dieser Besitzwechsel korrekt ist und als vertrauenswürdige, dauerhafte Historie gelten soll.\n\nFahren Sie nur fort, wenn Sie Verkaufs- oder Übertragungsdetails geprüft haben und von ihrer Richtigkeit überzeugt sind. Spätere Änderungen sind schwierig.",
  "studio.ledger.confirm.adminVerify.confirm": "Ja, Eigentum verifizieren",
  "studio.ledger.confirm.requestVerification.title":
    "Verifizierung für diese Übertragung anfordern?",
  "studio.ledger.confirm.requestVerification.body":
    "Sie beantragen, diesen Eigentumsschritt im Verifizierungsprozess voranzubringen. Die Anfrage wird Teil der Provenienzgeschichte.\n\nNutzen Sie dies, wenn Sie die Übertragungsdetails für korrekt halten und eine Prüfung wünschen.",
  "studio.ledger.confirm.requestVerification.confirm": "Ja, Anfrage einreichen",
  "studio.insight.fallbackTitle": "Einblick",
  "studio.insight.loadingSeries": "Serie wird aus der Akte geladen…",
  "studio.insight.noSeriesData": "Keine Seriendaten für diesen Zeitraum.",
  "studio.insight.howToRead": "So lesen Sie dies",
  "studio.insight.breakdownHeading": "Aufschlüsselung",
  "studio.insight.notesHeading": "Hinweise",
  "studio.insight.defaultValueLabel": "Wert",
  "studio.insight.loadFailed":
    "Dieser Einblick konnte nicht geladen werden. Bitte erneut versuchen.",
  "studio.insight.title.worksArtist": "Katalog-Highlights",
  "studio.insight.title.worksGallery": "Katalog im Zeitverlauf",
  "studio.insight.title.health": "Aktenzustand",
  "studio.insight.title.valueArtist": "Wertentwicklung",
  "studio.insight.title.valueGallery": "Deklarierter Wert",
  "studio.insight.line.worksArtist": "Werke",
  "studio.insight.line.worksGallery": "Kumulierte Werke",
  "studio.insight.breakdown.totalWorks": "Werke gesamt",
  "studio.insight.breakdown.uniqueWorks": "Einzelwerke",
  "studio.insight.breakdown.unique": "Einzeln",
  "studio.insight.breakdown.editionWorks": "Editionen",
  "studio.insight.breakdown.editions": "Editionen",
  "studio.insight.breakdown.mostActivePeriod": "Aktivste Periode",
  "studio.insight.breakdown.peakPeriod": "Spitzenperiode",
  "studio.insight.breakdown.fullyVerifiedStrict": "Vollständig verifiziert (streng)",
  "studio.insight.breakdown.withCertificate": "Mit Zertifikat",
  "studio.insight.breakdown.missingVerification": "Verifizierung fehlt",
  "studio.insight.breakdown.latestDeclared": "Zuletzt deklariert ({currency})",
  "studio.insight.bar.fullyVerified": "Vollständig verifiziert",
  "studio.insight.bar.certified": "Zertifiziert",
  "studio.insight.bar.incomplete": "Unvollständig",
  "studio.insight.note.healthNonAdditive":
    "Diese Balken sind nicht additiv: ein Werk kann in mehrere Kategorien zählen.",
  "studio.insight.note.healthStrictArtist":
    "„Vollständig verifiziert“ erfordert ein nicht widerrufenes Zertifikat, eine Galerie-Bestätigung und verifiziertes Eigentum. Dieser Balken ist strenger als das „verifiziert“-Badge pro Zeile in Ihrer Studio-Liste.",
  "studio.insight.note.healthStrictGallery":
    "„Vollständig verifiziert“ erfordert ein nicht widerrufenes Zertifikat, eine Galerie-Bestätigung und verifiziertes Eigentum. Dieser Balken ist strenger als das „verifiziert“-Badge pro Werk.",
  "studio.insight.note.valueBasisArtist":
    "Die Werte sind die zuletzt deklarierten Beträge pro Währung aus Ihren Wert-Ereignissen (gleiche Basis wie die Diagrammserie), nicht eine Summe aller aktuellen Listenpreise.",
  "studio.insight.note.valueBasisGallery":
    "Die Werte sind die zuletzt deklarierten Beträge pro Währung aus Wert-Ereignissen (gleiche Basis wie die Diagrammserie), nicht eine Summe aller aktuellen Listenpreise.",
  "studio.insight.subtitle.artist.catalogueSteadyGrowth":
    "Der Katalog ist stetig gewachsen.",
  "studio.insight.subtitle.artist.clearOwnership":
    "Der Katalog zeigt eine klare Eigentumsakte.",
  "studio.insight.subtitle.artist.ownershipPending":
    "Einige Eigentumskontinuität ist noch offen.",
  "studio.insight.subtitle.artist.continuityNeeded":
    "Einige Werke benötigen noch erfasste Kontinuität.",
  "studio.insight.subtitle.artist.valuesShifted":
    "Die zuletzt erfassten Werte haben sich gegenüber früheren Perioden verschoben.",
  "studio.insight.subtitle.artist.valuesSteady":
    "Die zuletzt erfassten Werte sind im Vergleich zu früheren Einträgen stabil.",
  "studio.insight.subtitle.artist.multiCurrencyTracked":
    "Werte werden in mehr als einer Währung geführt.",
  "studio.insight.subtitle.artist.addValueEvent":
    "Fügen Sie ein Wert-Ereignis hinzu, um die Entwicklung zu sehen.",
  "studio.insight.subtitle.artist.value.noEvents12mo":
    "Keine Wert-Ereignisse in den letzten 12 Monaten.",
  "studio.insight.subtitle.artist.value.multiCurrency":
    "Werte werden in mehreren Währungen geführt; jede Linie nutzt ihre eigene Skala.",
  "studio.insight.subtitle.artist.value.trendingUp":
    "Die zuletzt erfassten Werte steigen gegenüber früheren Einträgen.",
  "studio.insight.subtitle.artist.value.softened":
    "Die zuletzt erfassten Werte sind gegenüber früheren Einträgen gesunken.",
  "studio.insight.subtitle.artist.value.steady":
    "Die zuletzt erfassten Werte sind im Vergleich zu früheren Einträgen stabil.",
  "studio.insight.subtitle.gallery.registrySteady":
    "Registeraktivität ist über Ihre vertretenen Werke hinweg stabil.",
  "studio.insight.subtitle.gallery.ownershipPending":
    "Einige Eigentumskontinuität ist noch offen.",
  "studio.insight.subtitle.gallery.verificationSteady":
    "Verifizierungsaktivität ist in Ihrem Studio stabil.",
  "studio.insight.subtitle.gallery.recordsPending":
    "Einige Akten sind noch ausstehend.",
  "studio.insight.subtitle.gallery.value.noDeclared":
    "Keine deklarierten Werte in diesem Zeitraum für vertretene Werke.",
  "studio.insight.subtitle.gallery.value.multiCurrency":
    "Deklarierte Werte umfassen mehrere Währungen in Ihrem Studio.",
  "studio.insight.subtitle.gallery.value.trendingUp":
    "Die zuletzt deklarierten Werte steigen in Ihrem Studio.",
  "studio.insight.subtitle.gallery.value.softened":
    "Die zuletzt deklarierten Werte sind in jüngeren Perioden gesunken.",
  "studio.insight.subtitle.gallery.value.steady":
    "Deklarierte Werte sind in jüngeren Perioden stabil.",
  "studio.insight.subtitle.collector.ownershipPending":
    "Einige Eigentumskontinuität ist noch offen.",
  "studio.insight.subtitle.collector.ownershipEstablished":
    "Eigentumsakten sind gut etabliert.",
  "studio.insight.subtitle.collector.multiCurrency":
    "Die Sammlung ist in mehreren Währungen erfasst.",
  "studio.insight.subtitle.collector.consistentRecord":
    "Die Sammlung zeigt eine konsistente Akte im Zeitverlauf.",
  "studio.insight.subtitle.collector.value.noEvents":
    "Keine erfassten Werte in diesem Zeitraum.",
  "studio.insight.subtitle.collector.value.multiCurrency":
    "Ihre Sammlung umfasst mehrere Währungen.",
  "studio.insight.subtitle.collector.value.trendingUp":
    "Die zuletzt erfassten Werte steigen.",
  "studio.insight.subtitle.collector.value.softened":
    "Die zuletzt erfassten Werte sind gesunken.",
  "studio.insight.subtitle.collector.value.steady":
    "Erfasste Werte bleiben stabil.",
  "studio.activity.artworkRegistered": "Werk registriert: {title}",
  "studio.activity.valueUpdated": "Wert aktualisiert: {title}",
  "studio.activity.ownershipConfirmed": "Eigentum bestätigt: {title}",
  "studio.activity.ownershipClaimRejected": "Eigentumsanspruch abgelehnt",
  "studio.activity.authInviteSent":
    "Authentifizierungseinladung für {title}{registrySuffix} an {email} gesendet",
  "studio.activity.authenticatedAuthorship":
    "Urheberschaft authentifiziert: {title}{registrySuffix}",
  "studio.activity.representationConfirmed":
    "Vertretung bestätigt: {title}{registrySuffix}",
  "studio.activity.provenanceInitiated":
    "Kontinuitätsübertragung eingeleitet: {title}{registrySuffix} → {recipient}",
  "studio.activity.provenanceAccepted":
    "Kontinuitätsübertragung angenommen: {title}{registrySuffix}",
  "studio.activity.provenanceCompleted":
    "Kontinuitätsübertragung abgeschlossen: {title}{registrySuffix}",
  "studio.activity.galleryInviteSent":
    "Vertretungseinladung gesendet an {email}",
  "studio.activity.accountDeletionRequested":
    "Kontolöschung angefordert für {email}",
  "studio.activity.artworkVerified": "Werk verifiziert: {title}{registrySuffix}",
  "studio.activity.certificateIssued": "Zertifikat ausgestellt: {title}{registrySuffix}",
  "studio.activity.artistOnboarded":
    "{artist} hat die Register-Onboarding für {gallery} abgeschlossen.",
  "studio.activity.personalArchiveAdded":
    "Zum persönlichen Archiv hinzugefügt: {title}{registrySuffix}",
  "studio.activity.personalArchiveRemoved":
    "Aus persönlichem Archiv entfernt: {title}{registrySuffix}",
  "studio.activity.collectorOwnershipDeclared":
    "Eigentumserklärung erfasst: {title}{registrySuffix}",
  "studio.activity.galleryInviteAccepted": "Galerieeinladung angenommen",
  "studio.activity.unknown": "Aktivität erfasst",
  "registry.record.certificateOverview": "Zertifikatsübersicht",
};

const FR: Record<MessageKey, string> = {
  ...EN,
  "nav.registry": "Registre",
  "nav.field": "The Field",
  "nav.about": "À propos",
  "nav.signIn": "Connexion",
  "nav.takePart": "Participer",
  "nav.myAccount": "Mon compte",
  "nav.stewardship": "Studio",
  "nav.signOut": "Déconnexion",
  "nav.account": "Compte",
  "nav.regionLabel": "Région et langue",
  "ecosystem.role.creative": "Créatif",
  "ecosystem.role.organisation": "Organisation",
  "ecosystem.role.collector": "Collectionneur",
  "ecosystem.surface.studio": "Studio",
  "ecosystem.surface.field": "The Field",
  "ecosystem.surface.registry": "Registre",
  "field.home.title": "Découverte et présence publiques",
  "field.home.lede":
    "The Field est l’endroit où parcourir les Creatives, les Organisations et les entrées du Registre — des surfaces en lecture seule qui reflètent ce que les participants choisissent de rendre public. Le Studio reste l’espace d’édition de l’identité et de la gestion.",
  "field.home.explorerHeading": "Explorateur",
  "field.home.explorerBody":
    "Trois vues index — Creatives, Organisations et entrées du Registre — avec filtres et pagination. Pas de recommandations ni de classement payant.",
  "field.home.verifyHeading": "Vérifier",
  "field.home.verifyBody":
    "Consulter le statut de vérification et de certificat d’une entrée du Registre via son identifiant Registry.",
  "field.home.verifyLink": "Ouvrir la vérification",
  "field.home.registryNote":
    "Le Registre reste le système de référence. The Field s’y connecte en lecture ; le Studio est l’espace de gestion des entrées et profils.",
  "field.explorer.subNavLabel": "Explorateur Field",
  "field.explorer.tab.creatives": "Creatives",
  "field.explorer.tab.organisations": "Organisations",
  "field.explorer.tab.records": "Entrées",
  "field.explorer.hub.title": "Explorateur",
  "field.explorer.creatives.headline": "Découvrir les Creatives",
  "field.explorer.creatives.lede":
    "Parcourez les profils Creative publics sur The Field — pratique, vérification et empreinte registre. Découverte uniquement.",
  "field.explorer.creatives.searching": "recherche",
  "field.explorer.creatives.filtered": "filtres actifs",
  "field.explorer.creatives.filter.search": "Rechercher par nom",
  "field.explorer.creatives.filter.searchPlaceholder": "Nom…",
  "field.explorer.creatives.filter.practice": "Pratique",
  "field.explorer.creatives.filter.allPractices": "Toutes les pratiques",
  "field.explorer.creatives.filter.verification": "Vérification",
  "field.explorer.creatives.filter.allCreatives": "Tous les Creatives",
  "field.explorer.creatives.filter.verifiedOnly": "Vérifié au registre",
  "field.explorer.creatives.filter.verifiedHint":
    "Creatives avec entrées vérifiées au registre ou confirmation d’artiste sur dossier.",
  "field.explorer.creatives.filter.sort": "Tri",
  "field.explorer.creatives.filter.apply": "Appliquer",
  "field.explorer.creatives.sort.nameAsc": "Nom A–Z",
  "field.explorer.creatives.sort.nameDesc": "Nom Z–A",
  "field.explorer.creatives.sort.recent": "Récemment mis à jour",
  "field.explorer.creatives.empty.none":
    "Aucun Creative public pour le moment. Activez un profil dans le Studio.",
  "field.explorer.creatives.empty.filtered":
    "Aucun Creative ne correspond à votre recherche ou filtres.",
  "field.explorer.creatives.empty.clearFilters": "Effacer les filtres",
  "field.stub.preparing":
    "Cette route est préparée pour la Phase 2A. Le contenu et les données suivront dans les prochaines étapes PR1.",
  "field.stub.backHome": "Retour à The Field",
  "field.verify.title": "Vérifier",
  "field.verify.record.title": "Vérification d’entrée",
  "field.verify.hub.title": "Vérifier une entrée du Registre",
  "field.verify.hub.lede":
    "The Field affiche la confiance du registre — statut de vérification, participation et certificat. The Field ne vérifie pas ; il lit le registre.",
  "field.verify.hub.lookupHeading": "Vérifier par Registry ID",
  "field.verify.hub.lookupIntro":
    "Saisissez l’identifiant Registry d’une entrée pour voir son statut public.",
  "field.verify.hub.lookupLabel": "Registry ID",
  "field.verify.hub.lookupPlaceholder": "ex. RROWM-…",
  "field.verify.hub.lookupSubmit": "Vérifier le statut",
  "field.verify.hub.lookupHint":
    "Statut public uniquement. Le certificat complet nécessite une connexion.",
  "field.verify.hub.lookupRequired": "Saisissez une Registry ID.",
  "field.verify.hub.hierarchyTitle": "Ordre des signaux de confiance",
  "field.verify.hub.hierarchyIntro":
    "Interprétez les signaux dans cet ordre sur The Field. Les faits du registre priment sur le récit du profil.",
  "field.verify.hub.tier1.label": "Niveau 1 — Entrée du registre",
  "field.verify.hub.tier1.body":
    "Registry ID, statut de vérification de l’entrée et confirmation de l’artiste.",
  "field.verify.hub.tier2.label": "Niveau 2 — Organisation et œuvres vérifiées",
  "field.verify.hub.tier2.body":
    "Badge d’organisation vérifiée et nombre d’œuvres vérifiées — pas un score de popularité.",
  "field.verify.hub.tier3.label": "Niveau 3 — Certificat",
  "field.verify.hub.tier3.body":
    "Certificat enregistré ou révoqué pour une entrée vérifiée.",
  "field.verify.hub.section.verification.title": "Ce que signifie la vérification",
  "field.verify.hub.section.verification.body":
    "La vérification est l’attestation du registre qu’une entrée a des confirmations sur dossier — fondée sur le registre.",
  "field.verify.hub.section.provenance.title": "Ce que signifie la provenance",
  "field.verify.hub.section.provenance.body":
    "La provenance est la continuité chronologique d’une entrée — événements confirmés sur dossier.",
  "field.verify.hub.section.registryRecord.title": "Ce que sont les entrées du registre",
  "field.verify.hub.section.registryRecord.body":
    "Une entrée du registre est l’enregistrement canonique d’une œuvre. The Field lit ; le registre reste la source de vérité.",
  "field.verify.hub.section.howVerification.title": "Comment fonctionne la vérification",
  "field.verify.hub.section.howVerification.body":
    "Les participants gèrent les entrées dans le Studio. Le statut est écrit dans le registre. The Field affiche en lecture seule.",
  "field.verify.hub.section.certificates.title": "Comment fonctionnent les certificats",
  "field.verify.hub.section.certificates.body":
    "Après vérification, un certificat peut être enregistré. La vérification publique montre le statut ; le document complet exige une connexion.",
  "field.verify.hub.linkRecords": "Parcourir les entrées du registre",
  "field.presence.creative.title": "Profil Creative",
  "field.presence.organisation.title": "Profil Organisation",
  "field.presence.collector.title": "Profil Collectionneur",
  "field.record.title": "Entrée du Registre",
  "ecosystem.workspace.studio": "Studio",
  "ecosystem.workspace.organisationStudio": "Studio Organisation",
  "getStarted.pathTooltip":
    "Chaque parcours ouvre le bon espace Studio pour votre type de participant. Sous-jacent : une chronologie par œuvre, au dossier dans le Registre.",
  "account.hero.organisationIdentity": "Identité organisation",
  "account.profile.organisationProfile": "Profil organisation",
  "account.profile.publicProfileHint":
    "Biographie et liens affichés sur votre profil public.",
  "footer.navigate": "Navigation",
  "footer.access": "Accès",
  "footer.legal": "Mentions légales",
  "footer.social": "Réseaux",
  "footer.registry": "Registre",
  "footer.field": "The Field",
  "footer.about": "À propos",
  "footer.contact": "Contact",
  "footer.signIn": "Connexion",
  "footer.register": "Inscription",
  "footer.account": "Compte",
  "footer.privacy": "Confidentialité",
  "footer.terms": "Conditions",
  "footer.disclaimer": "Avertissement",
  "footer.tagline": "Registre · documentation · cadre institutionnel",
  "footer.copyright": "Tous droits réservés.",
  "footer.regionLabel": "Région et langue",
  "footer.blurb":
    "Un registre vérifiable cryptographiquement pour l'art contemporain, protégeant la paternité et la provenance.",
  "landing.hero.title": "Infrastructure pour la mémoire culturelle",
  "landing.hero.lede":
    "Un registre de provenance de confiance pour l'œuvre culturelle contemporaine, reliant paternité, propriété et dossier historique dans une archive évolutive unique.",
  "landing.hero.browseCatalogue": "Parcourir la galerie publique",
  "landing.hero.takePart": "Participer",
  "landing.hero.overview": "Aperçu",
  "landing.cta.title": "Rejoindre la continuité d'une œuvre",
  "landing.cta.takePart": "Participer →",
  "landing.cta.browseRegistry": "Parcourir le registre",
  "landing.thesis.title":
    "La continuité appartient à l'œuvre, pas dispersée dans des fichiers",
  "landing.thesis.card1Title": "État actuel",
  "landing.thesis.card1Body":
    "Une fiche catalogue par œuvre : la liste que vous vérifiez aujourd'hui.",
  "landing.thesis.card2Title": "Chronologie au dossier",
  "landing.thesis.card2Body":
    "Les jalons s'accumulent dans l'ordre ; les dépôts ultérieurs côtoient les précédents.",
  "landing.thesis.card3Title": "Rôles des participants",
  "landing.thesis.card3Body":
    "Association institutionnelle et activité studio collectionneur apparaissent où les participants les déposent.",
  "landing.flow.title":
    "Un fil pour l'œuvre, de la première inscription à la suite",
  "landing.flow.s1Label": "Nommer l'œuvre",
  "landing.flow.s1Detail":
    "Listez-la une fois. La pièce obtient une identité durable à laquelle artistes, galeries et collectionneurs reviennent.",
  "landing.flow.s2Label": "Joindre l'essentiel",
  "landing.flow.s2Detail":
    "Certificats, association galerie, notes de garde : tout arrive sur la même fiche.",
  "landing.flow.s3Label": "Voir le présent clairement",
  "landing.flow.s3Detail":
    "Ce qui est public aujourd'hui se lit facilement. Le privé reste derrière la connexion jusqu'à votre choix.",
  "landing.flow.s4Label": "Laisser le fil grandir",
  "landing.flow.s4Detail":
    "Chaque vente, transfert ou exposition ajoute une ligne à la même histoire, dans l'ordre.",
  "landing.workspace.title": "Où les holdings restent au dossier",
  "landing.workspace.takePart": "Participer",
  "landing.workspace.viewPublic": "Voir la couche publique",
  "landing.portfolio.title": "Gestion de portefeuille pour chaque rôle",
  "getStarted.title": "Choisissez comment participer",
  "getStarted.alreadyAccount": "Vous avez déjà un compte ?",
  "getStarted.signIn": "Connexion",
  "getStarted.roleNote": "Votre rôle suit votre profil, pas cette page seule.",
  "getStarted.artistTitle": "Je suis un Créatif",
  "getStarted.artistDesc":
    "Enregistrez les œuvres pour que présence, chronologie et certificats restent sur une fiche du Registre.",
  "getStarted.artistCta": "Continuer en tant que Créatif",
  "getStarted.galleryTitle": "Je représente une Organisation",
  "getStarted.galleryDesc":
    "Flux Organisation vérifiés : confirmations et listes au dossier pour les Créatifs représentés.",
  "getStarted.galleryCta": "Voir les offres et continuer",
  "getStarted.collectorTitle": "Je suis Collectionneur",
  "getStarted.collectorDesc":
    "Parcourez le catalogue public, lisez l'état actuel et déposez la garde lorsque vous détenez une œuvre.",
  "getStarted.collectorCta": "Continuer en tant que Collectionneur",
  "getStarted.catalogueTitle": "Sur le catalogue",
  "auth.signIn": "Connexion",
  "auth.resetPassword": "Réinitialiser le mot de passe",
  "auth.accessSubtitle": "Accédez au registre avec e-mail et mot de passe.",
  "auth.createAccount": "Créer un compte",
  "auth.resetSubtitle":
    "Entrez l'e-mail de votre compte. Nous enverrons un lien sécurisé pour un nouveau mot de passe.",
  "auth.email": "E-mail",
  "auth.password": "Mot de passe",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "auth.rememberMe": "Se souvenir de moi",
  "auth.signingIn": "Connexion…",
  "auth.sendReset": "Envoyer le lien",
  "auth.sending": "Envoi…",
  "auth.backToSignIn": "Retour à la connexion",
  "auth.needHelp": "Besoin d'aide ?",
  "auth.getStarted": "Commencer",
  "auth.artworkAuthHint":
    "Connectez-vous pour examiner et authentifier la fiche de l'œuvre.",
  "cookie.message":
    "Nous utilisons des cookies pour les fonctions essentielles et améliorer l'expérience.",
  "cookie.privacy": "Confidentialité",
  "cookie.terms": "Conditions",
  "cookie.accept": "Accepter",
  "cookie.decline": "Refuser",
  "contact.title": "Contact",
  "contact.lede": "Pour les demandes générales, partenariats ou questions institutionnelles.",
  "contact.note":
    "Nous lisons chaque message ; les délais dépendent du volume et de la nature de la demande. Pour l'export, la suppression de compte ou d'autres droits, utilisez Mon compte → Confidentialité et données.",
  "registry.hero.headline": "Parcourir les fiches vérifiées",
  "registry.hero.lede":
    "Explorez les œuvres enregistrées sur RROWM. Ouvrez une fiche pour la couche de vérification ; la page œuvre offre une présentation curatée.",
  "registry.hero.trustNote":
    "Seules les œuvres vérifiées apparaissent dans cet index. Les certificats ne sont pas exposés sur la grille publique. Connectez-vous pour voir un certificat complet le cas échéant.",
  "registry.hero.searching": "Recherche",
  "registry.hero.clearSearch": "Effacer la recherche",
  "archive.nav.personalArchive": "Archive personnelle",
  "archive.page.title": "Archive personnelle",
  "archive.page.lede":
    "Œuvres que vous gardez à portée de main pendant que leur fiche continue d’évoluer.",
  "archive.action.archive": "Archiver",
  "archive.action.archived": "Archivé",
  "archive.action.remove": "Retirer de l’archive",
  "archive.count.one": "Présent dans {count} archive personnelle",
  "archive.count.many": "Présent dans {count} archives personnelles",
  "archive.footnote":
    "Cette œuvre figure dans des archives personnelles tenues par des participants du registre.",
  "archive.empty.title": "Aucune œuvre archivée",
  "archive.empty.body":
    "Les œuvres placées dans votre archive personnelle restent faciles à retrouver au fil de l’évolution de la fiche.",
  "archive.empty.cta": "Parcourir le catalogue",
  "archive.loading": "Chargement de l’archive…",
  "archive.error.generic": "Cette action n’a pas pu être effectuée.",
  "archive.error.session": "Actualisez la page et réessayez.",
  "archive.card.statusVerified": "Vérifié au registre",
  "archive.card.statusRecorded": "Enregistré au registre",
  "archive.card.noImage": "Aucune image au dossier",
  "archive.card.archivedOn": "Archivé le {date}",
  "archive.card.currentRecord": "Fiche actuelle",
  "archive.card.viewWork": "Voir l’œuvre",
  "registry.filters.search": "Recherche",
  "registry.filters.searchPlaceholder": "Titre ou ID registre",
  "registry.filters.sort": "Tri",
  "registry.filters.sortNewest": "Plus récentes",
  "registry.filters.sortOldest": "Plus anciennes",
  "registry.filters.sortTitleAsc": "Titre A–Z",
  "registry.filters.sortTitleDesc": "Titre Z–A",
  "registry.filters.status": "Statut",
  "registry.filters.allWorks": "Toutes les œuvres",
  "registry.filters.apply": "Appliquer",
  "registry.empty.label": "Registre",
  "registry.empty.title": "Aucune fiche à afficher",
  "registry.empty.noSearch":
    "Aucune œuvre vérifiée ne correspond à votre recherche. Essayez d'autres mots-clés ou effacez la recherche.",
  "registry.empty.noRecords":
    "Pas encore d'œuvres vérifiées. Revenez lorsque des fiches seront publiées.",
  "registry.list.title": "Fiches vérifiées",
  "registry.list.page": "Page {page}",
  "registry.card.registryId": "ID registre",
  "registry.card.noImage": "Aucune image au dossier",
  "registry.card.untitled": "Sans titre",
  "registry.card.added": "Ajouté",
  "registry.card.certStatus": "Statut du certificat :",
  "registry.cert.verified": "Vérifié",
  "registry.cert.revoked": "Révoqué",
  "registry.card.viewRecord": "Voir la fiche registre",
  "registry.card.verifyCert": "Vérifier le certificat",
  "registry.card.viewCertLogin": "Voir le certificat (connexion requise)",
  "registry.card.artworkPage": "Page œuvre",
  "registry.pagination.showing": "{start}–{end} sur {total}",
  "registry.pagination.previous": "Précédent",
  "registry.pagination.next": "Suivant",
  "registry.pagination.pageOf": "Page {page} sur {totalPages}",
  "about.hero.title":
    "Un système pour enregistrer la paternité, la provenance et la vérification",
  "signup.joinTitle": "Rejoindre le registre",
  "signup.createArtistAccount": "Créer un compte Créatif",
  "signup.subtitleArtworkAuth":
    "Après la configuration, vous reviendrez pour examiner et authentifier la fiche de l'œuvre.",
  "signup.signingUpAs": "Vous vous inscrivez en tant que",
  "signup.studioDesc":
    "Votre studio regroupe les œuvres représentées, les actions de chronologie et l'état actuel.",
  "signup.alreadyRegistered": "Déjà inscrit ?",
  "signup.otherEntryPaths": "Autres parcours d'entrée",
  "signup.workEmail": "E-mail professionnel",
  "signup.confirmPassword": "Confirmer le mot de passe",
  "signup.passwordPlaceholder": "Au moins 8 caractères",
  "signup.confirmPlaceholder": "Saisir à nouveau le mot de passe",
  "signup.creatingProfile": "Création du profil…",
  "signup.createProfile": "Créer le profil",
  "signup.checkEmail":
    "Consultez votre e-mail pour confirmer votre adresse, puis revenez ici dans ce navigateur pour terminer.",
  "signup.role.artist": "Créatif",
  "signup.role.gallery": "Organisation",
  "signup.role.collector": "Collectionneur",
  "signup.err.inviteBlocked":
    "Cette invitation ne peut pas être utilisée pour l'inscription.",
  "signup.err.emailRequired": "Entrez votre adresse e-mail.",
  "signup.err.passwordLength": "Le mot de passe doit contenir au moins 8 caractères.",
  "signup.err.passwordMismatch": "Les mots de passe ne correspondent pas.",
  "signup.invite.title": "Invitation",
  "signup.invite.verifying": "Vérification de votre invitation…",
  "signup.invite.oneMoment": "Un instant.",
  "signup.invite.fetchError": "Cette invitation n'a pas pu être vérifiée",
  "signup.invite.expired": "Cette invitation a expiré",
  "signup.invite.used": "Cette invitation a déjà été utilisée",
  "signup.invite.invalid": "Cette invitation n'est pas valide",
  "signup.invite.usedSubtitle":
    "Si vous avez déjà un compte, connectez-vous ci-dessous. Sinon, créez un nouveau compte.",
  "signup.invite.fallbackSubtitle":
    "Vous pouvez toujours rejoindre le registre. Créez un compte ou connectez-vous.",
  "signup.invite.trustFooter":
    "Cette invitation a été envoyée via le registre RROWM. Vos informations servent uniquement à établir votre profil et ce qui figure au dossier.",
  "signup.invite.createArtistProfile": "Créer un profil artiste",
  "signup.invite.galleryInvited":
    "vous a invité à authentifier des fiches au dossier. Après la création de votre profil, vous les examinerez et les approfondirez.",
  "signup.invite.directedTo":
    "Cette invitation est adressée à {email}. Utilisez cette adresse pour vous inscrire.",
  "signup.invite.recordsTitle": "Fiches associées à votre pratique",
  "signup.invite.noArtworks":
    "Les fiches déposées par {gallery} apparaîtront dans votre studio une fois inscrit. Vous pourrez examiner, authentifier la paternité et approfondir chaque fiche.",
  "signup.invite.joinMasked":
    "Rejoignez le registre en tant que {email} pour authentifier la paternité, ajouter de la continuité et approfondir les fiches.",
  "signup.invite.joinGeneric":
    "Rejoignez le registre pour authentifier la paternité, ajouter de la continuité et approfondir les fiches.",
  "signup.invite.attestationNote":
    "Attestations en couches uniquement, pas d'arbitrage de propriété ni d'approbation institutionnelle.",
  "signup.invite.joinToAuthenticate": "Rejoindre pour authentifier",
  "studio.nav.studio": "Studio",
  "studio.nav.records": "Fiches",
  "studio.nav.artworks": "Œuvres",
  "studio.nav.certificates": "Certificats",
  "studio.nav.ownership": "Propriété",
  "studio.shell.activity": "Activité",
  "studio.shell.recentNotes": "Notes récentes",
  "studio.shell.catalogueActivity": "Activité catalogue",
  "studio.shell.browseCatalogue": "Parcourir la galerie publique",
  "studio.shell.noActivity": "Aucune activité récente.",
  "registry.record.trust.revokedHeadline": "Certificat révoqué",
  "registry.record.trust.revokedSub": "Cette fiche est signalée. Ne pas la traiter comme vérifiée.",
  "registry.record.trust.verifiedHeadline": "Fiche vérifiée",
  "registry.record.trust.verifiedSubCert":
    "Certificat au dossier. Document complet pour les utilisateurs autorisés.",
  "registry.record.trust.verifiedSubNoCert":
    "Enregistrée au registre ; aucun certificat émis pour l'instant.",
  "registry.record.trust.unverifiedHeadline": "Fiche registre",
  "registry.record.trust.unverifiedSub": "Œuvre enregistrée, pas encore vérifiée.",
  "registry.record.verificationBy": "Vérification enregistrée par {name}",
  "registry.record.badge.certificate": "Certificat",
  "registry.record.badge.noCertificate": "Pas de certificat",
  "registry.record.badge.locked": "Verrouillée",
  "registry.record.aboutWork": "À propos de l'œuvre",
  "registry.record.specifications": "Spécifications",
  "registry.record.provenance": "Provenance",
  "registry.record.certStatusTitle": "Statut du certificat",
  "registry.record.verificationTitle": "Vérification",
  "gallery.nav.studio": "Aperçu",
  "gallery.nav.recordDepth": "Profondeur de fiche",
  "gallery.nav.roster": "Artistes",
  "gallery.nav.catalogue": "Œuvres",
  "gallery.nav.verification": "Continuité & certificats",
  "gallery.nav.invitations": "Invitations",
  "gallery.shell.noCatalogueActivity": "Aucune activité catalogue récente.",
  "gallery.shell.loading": "Chargement…",
  "gallery.shell.dismiss": "Fermer",
  "gallery.hero.tooltip":
    "L'espace studio de votre institution. Gérez continuité, représentation et fiches catalogue.",
  "gallery.hero.institutionVerified": "Au dossier · institution vérifiée",
  "gallery.hero.verificationPending": "Vérification en attente",
  "gallery.hero.subscriptionGrace": "Période de grâce",
  "gallery.hero.subscriptionActive": "Abonné",
  "gallery.hero.subscriptionInactive": "Inactif",
  "gallery.hero.subscriptionTrial": "Essai",
  "gallery.hero.registryAuthority": "Autorité du registre",
  "gallery.hero.openCatalogue": "Ouvrir le catalogue",
  "gallery.hero.work": "œuvre",
  "gallery.hero.works": "œuvres",
  "gallery.hero.inGalleryCatalogue": "Dans le catalogue de la galerie",
  "gallery.hero.singleRegistryIds":
    "Identifiants registre uniques pour les artistes représentés.",
  "gallery.hero.institutionalVerification": "Vérification institutionnelle",
  "gallery.hero.trustAndCerts": "Confiance & certificats",
  "gallery.hero.worksVerified": "Œuvres vérifiées",
  "gallery.hero.verifiedLine": "{count} vérifiée(s)",
  "gallery.hero.awaitingLine": "{count} en attente",
  "gallery.hero.recordDepth": "Profondeur de fiche",
  "gallery.hero.mayDeepen": "peut s'approfondir",
  "gallery.hero.institutionAttestation": "attestation institutionnelle",
  "gallery.hero.artistAttestationOnFile": "avec attestation d'artiste au dossier",
  "gallery.hero.inviteOutstanding": "invitation en suspens",
  "gallery.hero.invitesOutstanding": "invitations en suspens",
  "gallery.hero.rosterAndInvites": "Effectif & invitations",
  "gallery.hero.adminCanInvite": "L'admin peut inviter depuis l'espace",
  "gallery.hero.institutionAttestationLine":
    "{count} attestation institutionnelle · {pending} peut s'approfondir",
  "gallery.hero.artistAttestationLine":
    "{count} avec attestation d'artiste au dossier · {invites} invitation(s) en suspens",
  "gallery.hero.openAmendments":
    "{count} modification(s) ouverte(s) : répondre au dossier",
  "gallery.hero.amendmentsPending": "{count} modification(s) en attente de revue",
  "gallery.hero.newInvitation": "Nouvelle invitation",
  "gallery.hero.registerWork": "Enregistrer une œuvre",
  "gallery.hero.inviteToAuthenticate": "Inviter à authentifier",
  "gallery.hero.aboutWorkspace": "À propos de cet espace",
  "gallery.hero.publicPage": "Page publique",
  "gallery.hero.account": "Compte",
  "gallery.hero.previewEmpty":
    "Enregistrez une fiche canonique pour mettre une œuvre en avant ici.",
  "gallery.intelligence.title": "Intelligence catalogue",
  "gallery.intelligence.syncing": "Synchronisation des métriques…",
  "gallery.intelligence.registrationPace": "Rythme d'enregistrement",
  "gallery.intelligence.worksRegistered": "œuvres enregistrées",
  "gallery.intelligence.addWorksTrend":
    "Ajoutez des œuvres pour voir la tendance cumulative.",
  "gallery.intelligence.tapCatalogueDetail":
    "Appuyez pour le détail catalogue et la composition.",
  "gallery.intelligence.declaredValue": "Valeur déclarée",
  "gallery.intelligence.noDeclaredValues":
    "Aucune valeur déclarée pour l'instant. Saisissez une valeur à l'enregistrement.",
  "gallery.intelligence.multiCurrencyTap":
    "Progression multi-devises · appuyez pour explorer.",
  "gallery.intelligence.recordHealth": "Santé des fiches",
  "gallery.intelligence.gaps": "Écarts",
  "gallery.intelligence.noData": "Pas encore de données.",
  "gallery.intelligence.loadingBreakdown": "Chargement de la répartition…",
  "gallery.intelligence.certificatesAndGaps":
    "Certificats et écarts de vérification · appuyez pour le graphique.",
  "gallery.intelligence.ofCatalogueVerified":
    "du catalogue vérifié au registre",
  "gallery.intelligence.recordsNotVerified":
    "{count} fiche(s) pas encore vérifiée(s)",
  "gallery.intelligence.galleryVerificationPending":
    "Vérification galerie en attente. L'attestation sera disponible après approbation.",
  "gallery.intelligence.queueClear": "File d'attente vide.",
  "gallery.intelligence.openVerification":
    "Ouvrir Vérification pour attester les œuvres en attente.",
  "gallery.summary.representedWorks":
    "{artists} représentés · {works} œuvres",
  "gallery.summary.verifiedSuffix": " · {count} vérifiée(s)",
  "gallery.summary.noRecentActivity": "Aucune activité récente.",
  "gallery.empty.createProfile": "Créer votre profil galerie",
  "gallery.empty.createProfileBody":
    "Cela établit votre présence et autorité dans le registre. Une fiche galerie liée est requise avant le chargement du tableau de bord.",
  "gallery.empty.continueOnboarding": "Continuer l'onboarding galerie →",
  "gallery.fallback.gallery": "Galerie",
  "gallery.fallback.artist": "Artiste",
  "gallery.fallback.untitled": "Sans titre",
  "gallery.recordDepth.empty":
    "Aucune attestation n'attend d'approfondissement. Quand des fiches canoniques sont au dossier, l'authentification artiste et les modifications apparaissent ici.",
  "gallery.roster.tooltip": "Lié à votre galerie sur le registre",
  "gallery.roster.noArtists": "Pas encore d'artistes",
  "gallery.roster.noArtistsBody":
    "Lorsque vous connectez des artistes, ils apparaissent ici avec le statut de représentation et le nombre d'œuvres.",
  "gallery.roster.goToInvitations": "Aller aux invitations",
  "gallery.roster.askAdmin": "Demandez à un administrateur d'inviter des artistes.",
  "gallery.roster.viewPublicProfile": "Voir le profil public",
  "gallery.roster.noPublicProfile": "Pas de profil public",
  "gallery.roster.artist": "artiste",
  "gallery.roster.artists": "artistes",
  "gallery.representation.represented": "Représenté",
  "gallery.representation.historical": "Historique",
  "gallery.representation.pending": "En attente",
  "gallery.catalogue.tooltip":
    "Fiches catalogue déposées par votre institution. Enregistrez une œuvre pour ouvrir la chronologie et ajouter des attestations institutionnelles.",
  "gallery.catalogue.registerWork": "Enregistrer une œuvre",
  "gallery.catalogue.registeredWorks": "Œuvres enregistrées",
  "gallery.catalogue.inCatalogue": "{count} au catalogue",
  "gallery.catalogue.empty":
    "Pas encore d'œuvres au catalogue institutionnel. Enregistrez une fiche canonique à tout moment. Les comptes artistes sont optionnels.",
  "gallery.catalogue.artistOnFile": "Artiste au dossier",
  "gallery.catalogue.artistAttestationOnFile": "Attestation d'artiste au dossier",
  "gallery.catalogue.artistAttestationMayDeepen": "L'attestation d'artiste peut s'approfondir",
  "gallery.catalogue.artistAttestationNotYetOnFile":
    "Attestation d'artiste pas encore au dossier",
  "gallery.catalogue.verified": "Vérifiée",
  "gallery.catalogue.onFile": "Au dossier",
  "gallery.catalogue.invitationOnFile": "Invitation au dossier",
  "gallery.catalogue.inviteArtistAuthenticate": "Inviter l'artiste à authentifier",
  "gallery.verification.tooltip":
    "Confirmez seulement quand la fiche est prête. Une étape de confirmation suit.",
  "gallery.verification.notVerifiedInstitution":
    "Votre institution n'est pas encore vérifiée. Les actions de vérification sont indisponibles.",
  "gallery.verification.nothingAwaiting": "Rien n'attend de vérification.",
  "gallery.verification.markVerified": "Marquer vérifiée",
  "gallery.guide.title": "À propos de cet espace",
  "gallery.guide.body":
    "Cet espace regroupe votre catalogue registre, la participation, Continuité & certificats, et les Invitations pour l'authentification artiste optionnelle. Enregistrez des fiches canoniques à tout moment avec un nom d'artiste en clair ; la participation en couches s'approfondit : dépôt institutionnel d'abord, puis attestation artiste quand prêt.",
  "gallery.readiness.tooltip":
    "Contrôles opérationnels sur les fiches catalogue, pas de l'analytique.",
  "gallery.readiness.title": "Préparation des fiches",
  "gallery.readiness.ready": "prête",
  "gallery.readiness.needsAttention": "attention requise",
  "gallery.readiness.incomplete": "incomplète",
  "gallery.readiness.allPass":
    "Toutes les fiches catalogue passent les contrôles de préparation.",
  "gallery.integrity.tooltip":
    "Signaux d'intégrité et de complétude de provenance dérivés de vos fiches existantes.",
  "gallery.integrity.title": "Intégrité des fiches",
  "gallery.integrity.complete": "complète",
  "gallery.integrity.needsAttention": "attention requise",
  "gallery.integrity.incomplete": "incomplète",
  "gallery.integrity.allPass":
    "Toutes les fiches catalogue respectent les contrôles d'intégrité.",
  "gallery.priority.tooltip":
    "Orientation opérationnelle ordonnée selon intégrité, vérification, signaux de valeur, contexte marché et récence.",
  "gallery.priority.title": "File de priorité",
  "gallery.priority.immediate": "Immédiat",
  "gallery.priority.high": "Élevé",
  "gallery.priority.standard": "Standard",
  "gallery.priority.low": "Faible",
  "gallery.participation.descIntro":
    "Chaque œuvre ci-dessous est une fiche canonique au dossier avec la couche de continuité de votre institution.",
  "gallery.participation.descMiddle":
    "L'attestation d'artiste peut s'approfondir lorsque l'artiste authentifie la paternité.",
  "gallery.participation.descOutro":
    "La fiche est complète ; les couches s'accumulent.",
  "gallery.participation.title": "Les attestations peuvent s'approfondir",
  "gallery.participation.record": "fiche",
  "gallery.participation.records": "fiches",
  "gallery.participation.inviteAuthenticate": "Inviter à authentifier",
  "gallery.participation.untitledWork": "Œuvre sans titre",
  "gallery.participation.noImage": "Pas d'image",
  "gallery.participation.associatedArtist": "Artiste associé",
  "gallery.participation.institutionLayer": " · Couche institutionnelle {when}",
  "gallery.participation.publicRecord": "Fiche publique",
  "gallery.status.ready": "Prête",
  "gallery.status.needsAttention": "Attention requise",
  "gallery.status.incomplete": "Incomplète",
  "gallery.status.complete": "Complète",
  "gallery.invitations.hubDesc":
    "Deux canaux de continuité : représentation générale et authentification spécifique à l'œuvre. La fiche canonique existe indépendamment ; les invitations approfondissent les attestations des participants.",
  "gallery.invitations.tabRepresentation": "Représentation",
  "gallery.invitations.tabArtworkAuth": "Authentification d'œuvre",
  "gallery.invitations.tabListLabel": "Type d'invitation",
  "gallery.invitations.sectionTooltip":
    "Invitez des artistes à authentifier des fiches liées à leur pratique. La fiche d'œuvre canonique existe indépendamment ; les invitations approfondissent les attestations, pas des workflows d'approbation galerie.",
  "gallery.invitations.sendRepresentationLabel": "Envoyer une invitation de représentation",
  "gallery.invitations.artistEmail": "E-mail de l'artiste",
  "gallery.invitations.emailPlaceholder": "artiste@exemple.com",
  "gallery.invitations.sentAs": "Envoyé au nom de :",
  "gallery.invitations.representationBody":
    "L'artiste reçoit une invitation formelle pour examiner et confirmer les fiches au dossier, en référence à votre institution.",
  "gallery.invitations.duplicatePending":
    "Une invitation est déjà en attente pour cette adresse.",
  "gallery.invitations.resend": "Renvoyer l'invitation",
  "gallery.invitations.adminOnly": "Seuls les administrateurs peuvent envoyer des invitations.",
  "gallery.invitations.noneSent": "Aucune invitation n'a encore été envoyée.",
  "gallery.invitations.colArtist": "Artiste",
  "gallery.invitations.colStatus": "Statut",
  "gallery.invitations.colSentDate": "Date d'envoi",
  "gallery.invitations.colActions": "Actions",
  "gallery.invitations.statusDeclined": "Refusée",
  "gallery.invitations.copyInviteLink": "Copier le lien d'invitation",
  "gallery.invitations.copied": "Copié",
  "gallery.invitations.publishing": "Publication…",
  "gallery.invitations.publish": "Publier",
  "gallery.invitations.manualDraftHint":
    "Si l'e-mail d'invitation n'a pas pu être envoyé, vous pouvez copier un brouillon.",
  "gallery.invitations.copyDraft": "Copier le brouillon",
  "gallery.invitations.representationSectionTitle": "Invitations de représentation",
  "gallery.invitations.representationSectionDesc":
    "Invitez des artistes à rejoindre votre institution de façon générale, distinctement de l'authentification spécifique à l'œuvre.",
  "gallery.artworkAuth.sectionTitle": "Invitations d'authentification d'œuvre",
  "gallery.artworkAuth.sectionDescIntro":
    "Historique de continuité pour des fiches canoniques spécifiques.",
  "gallery.artworkAuth.emptyBody":
    "Pas encore d'invitations d'authentification d'œuvre. Depuis Œuvres, utilisez {cta} sur une fiche enregistrée.",
  "gallery.artworkAuth.sentPrefix": "Envoyée",
  "gallery.artworkAuth.resend": "Renvoyer",
  "gallery.artworkAuth.copyLink": "Copier le lien",
  "gallery.artworkAuth.statusAuthenticated": "Paternité authentifiée",
  "gallery.artworkAuth.statusWithdrawn": "Retirée",
  "gallery.artworkAuth.statusExpired": "Expirée",
  "gallery.artworkAuth.statusAwaiting": "Authentification en attente",
  "gallery.artworkAuth.modalTitle": "Inviter l'artiste à authentifier",
  "gallery.artworkAuth.modalLead":
    "Cette fiche d'œuvre est déjà au dossier dans le registre. Invitez l'artiste à authentifier la paternité, approfondir la chronologie et contribuer des détails d'auteur.",
  "gallery.artworkAuth.modalOutcome":
    "L'artiste recevra une invitation de continuité liée spécifiquement à cette œuvre.",
  "gallery.artworkAuth.ctaSend": "Envoyer l'invitation de continuité",
  "gallery.artworkAuth.artistOnFile": "Artiste au dossier :",
  "gallery.artworkAuth.institutionContinuityPending": "Continuité institutionnelle en attente",
  "gallery.artworkAuth.personalNote": "Note personnelle (optionnelle)",
  "gallery.artworkAuth.notePlaceholder":
    "Une brève note de continuité. Ton archivistique, pas une demande d'approbation.",
  "gallery.artworkAuth.adminOnlyError":
    "Seuls les administrateurs galerie peuvent envoyer des invitations d'authentification d'œuvre.",
  "gallery.artworkAuth.invalidEmail": "Saisissez un e-mail d'artiste valide.",
  "gallery.artworkAuth.sendFailed": "L'invitation n'a pas pu être envoyée.",
  "gallery.artworkAuth.networkError": "Erreur réseau. Réessayez.",
  "gallery.artworkAuth.inviteOnFile": "Invitation au dossier pour {email}.",
  "gallery.artworkAuth.inviteSent": "Invitation de continuité envoyée à {email}.",
  "gallery.artworkAuth.close": "Fermer",
  "gallery.toast.loadMembershipFailed": "Impossible de charger l'appartenance à la galerie.",
  "gallery.toast.requestIncomplete": "La requête n'a pas abouti ({status}).",
  "gallery.toast.inviteRecordAdminOnly":
    "Seuls les administrateurs galerie peuvent enregistrer des invitations.",
  "gallery.toast.inviteDuplicateOnFile":
    "Une invitation est déjà au dossier pour cette adresse.",
  "gallery.toast.inviteOnFileWithDetail": "Au dossier pour {email}. {detail}",
  "gallery.toast.inviteSentTo": "Invitation au dossier. Copie envoyée à {email}.",
  "gallery.toast.inviteRecordedNoEmail":
    "Enregistré pour {email}. E-mail non envoyé ; copiez le brouillon manuel ou ajustez les paramètres mail.",
  "gallery.toast.inviteResentSignupLink":
    "Invitation renvoyée au dossier. Nouveau lien d'inscription envoyé à l'artiste.",
  "gallery.toast.inviteLinkRefreshedNoEmail":
    "Lien d'invitation actualisé au dossier. E-mail non envoyé ; copiez le lien depuis la ligne.",
  "gallery.toast.inviteVisibilityPublic":
    "Visibilité mise à jour. L'artiste est maintenant public sur votre page institutionnelle.",
  "gallery.toast.couldNotPublish": "Publication impossible ({status}).",
  "gallery.toast.couldNotResend": "Renvoi impossible ({status}).",
  "gallery.toast.artworkAuthResent": "Invitation d'authentification d'œuvre renvoyée.",
  "gallery.toast.artworkAuthRefreshedNoEmail":
    "Invitation actualisée au dossier ; e-mail non envoyé.",
  "gallery.toast.copyFailed": "Copie impossible. Sélectionnez le texte manuellement.",
  "gallery.toast.imageRequired":
    "Une image est requise pour ouvrir la fiche canonique au dossier.",
  "gallery.toast.artistNameRequired":
    "Le nom d'artiste est requis lorsqu'aucun artiste du roster n'est lié.",
  "gallery.toast.registerFailedDetail":
    "L'œuvre n'a pas pu être enregistrée au dossier. Vérifiez permissions, champs requis et migrations catalogue.",
  "gallery.toast.profileAdminOnly":
    "Seuls les administrateurs galerie peuvent modifier la présence institutionnelle.",
  "gallery.toast.profileSaveFailed": "Les modifications n'ont pas pu être déposées.",
  "gallery.toast.verifyFailed": "La vérification n'a pas abouti.",
  "gallery.toast.verifySuccess":
    "Attestation enregistrée. Cette œuvre est maintenant vérifiée au registre.",
  "gallery.toast.certificateFailed": "Le certificat n'a pas pu être déposé.",
  "gallery.toast.certificateFiled": "Certificat déposé pour cette œuvre.",
  "gallery.toast.certificateAlreadyOnFile":
    "Certificat déjà au dossier pour cette œuvre.",
  "gallery.toast.certificateRetryFailed":
    "Le certificat n'a pas pu être déposé. Réessayez.",
  "gallery.toast.representationEndedFull":
    "Représentation terminée au dossier. Les dépôts antérieurs restent visibles sur la chronologie.",
  "gallery.toast.latestActivity": "Dernière activité : {title}",
  "gallery.toast.latestActivityWhen": "Dernière activité : {title} · {when}",
  "gallery.toast.registerRequestFailed": "Requête échouée.",
  "gallery.artworkAuth.review.loading": "Chargement de la revue de fiche…",
  "gallery.artworkAuth.review.loadFailed":
    "Impossible de charger cette revue. Réessayez le lien.",
  "gallery.artworkAuth.review.missingLink":
    "Lien de revue manquant. Ouvrez cette page depuis l'e-mail d'invitation ou le studio artiste.",
  "gallery.artworkAuth.review.loadFailedHint":
    "Le lien a peut-être expiré ou la fiche a changé. Réessayez le lien ou contactez l'institution.",
  "gallery.artworkAuth.review.joinRegistry": "Rejoindre le registre",
  "gallery.artworkAuth.review.signIn": "Se connecter",
  "gallery.artworkAuth.review.joinPrompt":
    "Si vous êtes artiste et souhaitez rejoindre le registre, créez un compte ou connectez-vous.",
  "gallery.artworkAuth.review.authFailed":
    "Impossible d'authentifier la paternité au dossier.",
  "gallery.artworkAuth.review.wrongEmail":
    "Cette invitation a été envoyée à une autre adresse. Connectez-vous avec l'adresse invitée ou demandez un renvoi.",
  "gallery.artworkAuth.review.notAuthorized":
    "Votre compte ne correspond pas à l'artiste nommé. Connectez-vous avec l'e-mail invité ou contactez l'institution.",
  "gallery.artworkAuth.review.contributeFailed": "Impossible de déposer la contribution.",
  "gallery.artworkAuth.review.withdrawn":
    "Cette invitation de continuité a été retirée. L'institution peut en envoyer une nouvelle.",
  "gallery.artworkAuth.review.expired":
    "Ce lien d'invitation a expiré. L'institution peut en envoyer un nouveau.",
  "gallery.artworkAuth.review.unavailable":
    "Cette revue n'est pas disponible. Déjà authentifiée ou lien modifié.",
  "gallery.artworkAuth.review.authenticatedTitle":
    "Paternité authentifiée au dossier",
  "gallery.artworkAuth.review.authenticatedBody":
    "Vous pouvez approfondir la chronologie avec une contribution d'auteur archivistique.",
  "gallery.artworkAuth.review.viewPublicRecord": "Voir la fiche publique",
  "gallery.artworkAuth.review.contributeAuthorship": "Contribuer à l'auteur",
  "gallery.artworkAuth.review.artistStudio": "Studio artiste",
  "gallery.artworkAuth.review.openPublicRecord": "Ouvrir la fiche publique",
  "gallery.artworkAuth.review.openPublicRecordHint":
    "dans un nouvel onglet pour le contexte chronologique complet.",
  "gallery.artworkAuth.review.signInPrompt":
    "Rejoignez le registre ou connectez-vous en tant que {email} pour authentifier la paternité et approfondir la fiche.",
  "gallery.artworkAuth.review.signInPromptGeneric":
    "Rejoignez le registre ou connectez-vous pour authentifier la paternité et approfondir la fiche au dossier.",
  "gallery.artworkAuth.review.joinToReview": "Rejoindre pour revoir",
  "gallery.artworkAuth.review.authenticateCta": "Authentifier la paternité au dossier",
  "gallery.artworkAuth.review.viewRecordFirst": "Voir d'abord la fiche publique",
  "gallery.artworkAuth.review.cardTooltip":
    "Une œuvre liée à votre pratique est au dossier dans le registre. Revoyez la fiche, puis authentifiez la paternité.",
  "gallery.artworkAuth.review.workOnFile": "Œuvre au dossier",
  "gallery.artworkAuth.review.institutionLabel": "Institution au dossier",
  "gallery.artworkAuth.review.artistLabel": "Artiste au dossier",
  "gallery.artworkAuth.review.personalMessage": "Message personnel de l'institution",
  "gallery.artworkAuth.review.joinPlatformPrompt":
    "Rejoignez le registre pour authentifier la paternité et approfondir la fiche documentaire au dossier.",
  "gallery.ops.reason.registryIdMissing": "ID registre manquant",
  "gallery.ops.reason.noArtistLinked": "Aucun artiste lié",
  "gallery.ops.reason.noOwnership": "Aucune propriété au dossier",
  "gallery.ops.reason.noOwnershipHistory": "Aucun historique de propriété au dossier",
  "gallery.ops.reason.ownershipLedgerMismatch":
    "Le registre de propriété ne correspond pas au propriétaire actuel",
  "gallery.ops.reason.titleMissing": "Titre manquant",
  "gallery.ops.reason.metadataFingerprintMissing": "Empreinte métadonnées manquante",
  "gallery.ops.reason.missingDeclaredValue": "Valeur déclarée manquante",
  "gallery.ops.reason.missingImage": "Image manquante",
  "gallery.ops.reason.incompleteMetadata": "Métadonnées incomplètes (année / medium)",
  "gallery.ops.reason.certificateRevoked": "Certificat révoqué",
  "gallery.ops.reason.missingVerification": "Vérification manquante",
  "gallery.ops.reason.noCertificateOnFile": "Aucun certificat au dossier",
  "gallery.ops.reason.listedWithoutVerification":
    "Listé sur le marché sans vérification",
  "gallery.ops.reason.listedWithoutCertificate":
    "Listé sur le marché sans certificat",
  "gallery.ops.reason.noDeclaredValueOnFile": "Aucune valeur déclarée au dossier",
  "gallery.ops.reason.highDeclaredValue": "Valeur déclarée élevée",
  "gallery.ops.reason.materialDeclaredValue": "Valeur déclarée significative",
  "gallery.ops.reason.verifiedWithoutCertificate": "Vérifié sans certificat",
  "gallery.ops.reason.noVerificationSignals": "Aucun signal de vérification",
  "gallery.ops.reason.certifiedRecord": "Fiche certifiée",
  "gallery.ops.reason.recentActivity": "Activité récente",
  "gallery.ops.reason.oldIncomplete": "Ancienne fiche encore incomplète",
  "gallery.ops.reason.highValueNoCertificate": "Valeur élevée sans certificat",
  "gallery.ops.action.assignArtist": "Assigner l'artiste",
  "gallery.ops.action.viewRecord": "Voir la fiche",
  "gallery.ops.action.completeDetails": "Compléter les détails",
  "gallery.ops.action.addValue": "Ajouter une valeur",
  "gallery.ops.action.verifyRecord": "Vérifier la fiche",
  "gallery.ops.action.issueCertificate": "Émettre un certificat",
  "gallery.ops.recommended.noAction": "Aucune action requise",
  "gallery.ops.recommended.reviewRecord": "Examiner la fiche",
  "gallery.api.invalidJson": "JSON invalide",
  "gallery.api.invalidBody": "Corps de requête invalide",
  "gallery.api.unauthorized": "Non autorisé",
  "gallery.api.missingGalleryId": "gallery_id manquant",
  "gallery.api.invalidArtistEmail": "artist_email invalide",
  "gallery.api.inviteAdminOnly":
    "Seuls les administrateurs de galerie peuvent envoyer des invitations.",
  "gallery.api.resendAdminOnly":
    "Seuls les administrateurs de galerie peuvent renvoyer des invitations.",
  "gallery.api.couldNotLoadGallery": "Impossible de charger la galerie.",
  "gallery.api.galleryNotFound": "Galerie introuvable.",
  "gallery.api.couldNotVerifyInviteState":
    "Impossible de vérifier l'état de l'invitation.",
  "gallery.api.alreadyInvited": "Cet artiste a déjà été invité.",
  "gallery.api.couldNotRecordInvite": "Impossible d'enregistrer l'invitation.",
  "gallery.api.missingInviteId": "invite_id ou inviteId manquant.",
  "gallery.api.inviteNotFound": "Invitation introuvable.",
  "gallery.api.inviteNotPending":
    "Seules les invitations en attente peuvent être réémises.",
  "gallery.api.missingArtworkId": "artwork_id manquant",
  "gallery.api.artworkNotFound": "Œuvre introuvable",
  "gallery.api.noInstitutionContext":
    "Cette œuvre n'a pas de contexte institutionnel de dépôt.",
  "gallery.api.emailCreatedFailed":
    "Invitation enregistrée. E-mail non envoyé ; copiez le lien depuis la ligne si besoin.",
  "gallery.api.emailUpdatedFailed":
    "Lien d'invitation actualisé. E-mail non envoyé ; copiez le lien depuis la ligne si besoin.",
  "gallery.api.notAuthorisedInstitution": "Non autorisé pour cette institution",
  "gallery.api.artworkAuthDuplicatePending":
    "Une invitation d'authentification en attente existe déjà pour cette adresse sur cette œuvre.",
  "gallery.api.artworkAuthAlreadyCompleted":
    "Cette invitation est déjà complétée au dossier.",
  "gallery.inviteDraft.subject":
    "{galleryName} vous a invité à rejoindre le registre RROWM",
  "gallery.inviteDraft.to": "À : {email}",
  "gallery.inviteDraft.bodyIntro":
    "{galleryName} vous a invité à rejoindre le registre RROWM en tant qu'artiste représenté.",
  "gallery.inviteDraft.acceptLine1":
    "Pour accepter, utilisez le lien personnalisé de l'e-mail du registre (jeton à usage unique).",
  "gallery.inviteDraft.acceptLine2":
    "Inscrivez-vous avec exactement cette adresse invitée.",
  "gallery.inviteDraft.registrySignup":
    "Inscription registre : {site}/signup?invite_token=<coller-depuis-e-mail-registre>",
  "gallery.inviteDraft.galleryPage": "Page galerie : {url}",
  "gallery.inviteDraft.galleryPagePlaceholder":
    "Page galerie : {site}/gallery/<gallery-slug>",
  "gallery.inviteDraft.afterOnboarding":
    "Après l'onboarding artiste, votre invitation est confirmée et votre galerie peut être notifiée.",
  "gallery.email.artistInvite.subject": "{galleryName} · Authentifier les fiches au dossier",
  "gallery.email.artistInvite.preheader":
    "Authentifier et approfondir les fiches liées à votre pratique",
  "gallery.email.artistInvite.kicker": "Fiche canonique · Attestation du participant",
  "gallery.email.artistInvite.body1":
    "{galleryName} participe à la chronologie au dossier pour les œuvres liées à votre pratique. {inviteRecordExists} Vous êtes invité à authentifier la paternité et approfondir la fiche documentaire — pas à approuver un dépôt institutionnel.",
  "gallery.email.artistInvite.body2":
    "Après votre adhésion : examiner la fiche canonique, authentifier la paternité, ajouter des détails d'artiste et contribuer aux événements de continuité. {recordDeepensOverTime}.",
  "gallery.email.artistInvite.body3":
    "Le lien est réservé à cette adresse, à usage unique, et expire selon l'invitation enregistrée.",
  "gallery.email.artistInvite.cta": "Authentifier et rejoindre",
  "gallery.email.artistInvite.footnote":
    "Si ce message ne vous est pas destiné, ne prenez aucune action. Ne transférez pas le lien.",
  "gallery.email.artistInvite.textIntro":
    "{galleryName} participe à la chronologie pour les œuvres liées à votre pratique.",
  "gallery.email.artistInvite.textLink": "Authentifier et rejoindre (lien à usage unique) :",
  "gallery.email.artistInvite.textRegister":
    "Inscrivez-vous uniquement avec cet e-mail : {email}",
  "gallery.email.artistInvite.textDisregard":
    "Si ce message a été envoyé par erreur, ignorez-le.",
  "gallery.email.artworkAuth.subject":
    "Authentifier la fiche d'œuvre au dossier · {title}",
  "gallery.email.artworkAuth.preheader":
    "Examiner, authentifier et approfondir une fiche d'œuvre canonique au dossier.",
  "gallery.email.artworkAuth.kicker": "Fiche d'œuvre · Invitation de continuité",
  "gallery.email.artworkAuth.body1":
    "Une œuvre liée à votre pratique est déjà enregistrée dans le registre.",
  "gallery.email.artworkAuth.body2":
    "{title}{registryLine}Déposée avec participation de continuité de {galleryName}.",
  "gallery.email.artworkAuth.body3":
    "Vous êtes invité à examiner, authentifier la paternité et approfondir la fiche documentaire. {recordDeepensOverTime}. Ce n'est pas une demande d'approbation ni une tâche d'onboarding pour l'institution.",
  "gallery.email.artworkAuth.noteFrom": "Note de {galleryName} :",
  "gallery.email.artworkAuth.body4":
    "Le lien est réservé à cette adresse et expire selon l'invitation enregistrée.",
  "gallery.email.artworkAuth.cta": "Examiner la fiche d'œuvre",
  "gallery.email.artworkAuth.footnote":
    "Si ce message ne vous est pas destiné, ne prenez aucune action. Ne transférez pas le lien.",
  "gallery.email.fallback.institution": "Une institution",
  "gallery.email.fallback.artwork": "Œuvre au dossier",
  "gallery.email.fallback.gallery": "Galerie",
  "representation.publicParticipationOnFile": "Participation publique au dossier",
  "representation.artistAttestationOnFile": "Attestation d'artiste au dossier",
  "representation.artistAttestationMayDeepen": "L'attestation d'artiste peut s'approfondir",
  "pricing.eyebrow": "Studio Organisation · accès payant",
  "pricing.title": "Choisissez comment votre Studio Organisation utilise RROWM",
  "pricing.pro.continue": "Continuer vers l'inscription",
  "pricing.enterprise.contact": "Contacter le registre",
  "about.principles.title": "Un registre conçu pour la confiance",
  "about.tabs.what": "Qu'est-ce que c'est",
  "about.tabs.how": "Comment ça marche",
  "about.tabs.visibility": "Visibilité",
  "about.tabs.properties": "Propriétés",
  "about.tabs.who": "Pour qui",
  "about.what.title": "Ce qu'est le registre",
  "about.how.title": "Comment ça marche",
  "about.visibility.title": "Fiche publique, détail privé",
  "about.properties.title": "Propriétés du système",
  "about.audience.title": "Pour qui c'est",
  "collector.nav.workspace": "Studio",
  "collector.nav.works": "Œuvres",
  "collector.nav.attention": "Attention",
  "collector.shell.publicCollection": "Collection publique",
  "collector.shell.publicListingsNote":
    "Les listes publiques n'affichent que les œuvres à propriété vérifiée.",
  "collector.shell.loading": "Chargement…",
  "collector.hero.fallbackCollection": "Votre collection",
  "collector.hero.tooltip":
    "Un espace calme pour ce que vous détenez. État de propriété, points d'attention et historique — sans chrome marketing du catalogue.",
  "collector.hero.ownershipOnRecord": "Propriété au dossier",
  "collector.hero.viewWorks": "Voir les œuvres",
  "collector.hero.inStewardship": "Dans votre studio",
  "collector.hero.studioSince": "Studio depuis {year}",
  "collector.hero.work": "œuvre",
  "collector.hero.works": "œuvres",
  "collector.hero.verifiedOwnership": "Propriété vérifiée",
  "collector.hero.privateByDefault": "Privé par défaut",
  "collector.hero.accountPresence": "Compte & présence",
  "collector.hero.profile": "Profil",
  "collector.hero.on": "Activé",
  "collector.hero.off": "Désactivé",
  "collector.hero.publicPageAvailable": "Page de collection publique disponible.",
  "collector.hero.workspacePrivate": "Pas de profil public. Le studio reste privé.",
  "collector.hero.anonymousLabel": "Libellé anonyme",
  "collector.hero.nameShown": "Nom affiché",
  "collector.hero.continuity": "Continuité",
  "collector.hero.openAttention": "Ouvrir l'attention ({count})",
  "collector.hero.nothingNeedsAttention": "Rien ne requiert d'attention",
  "collector.hero.item": "élément",
  "collector.hero.items": "éléments",
  "collector.hero.attentionLabel": "Transferts, revendications & vérification",
  "collector.hero.actionSuggested": "Action suggérée",
  "collector.hero.allClear": "Tout est en ordre",
  "collector.hero.publicCollection": "Collection publique",
  "collector.hero.publicPageWhenSlug": "Page publique quand le slug est disponible",
  "collector.hero.registry": "Registre",
  "collector.hero.previewEmpty":
    "Les œuvres que vous détenez apparaîtront ici avec des images lorsque les fiches les incluent.",
  "collector.hero.previewNoImages":
    "Les images apparaissent lorsque les œuvres incluent des visuels.",
  "collector.overview.srOnly": "Aperçu de la collection",
  "collector.overview.empty":
    "Aucune œuvre détenue pour l'instant. Lorsque vous revendiquez ou recevez la propriété, elles apparaîtront ici.",
  "collector.overview.held": "{count} {units} détenues.",
  "collector.overview.verifiedOwnership":
    "{count} fiche(s) de propriété vérifiée(s).",
  "collector.overview.pendingTransfer": "{count} {units} en attente.",
  "collector.overview.notVerified":
    "{count} fiche(s) de propriété pas encore vérifiée(s).",
  "collector.overview.openClaims": "{count} revendication(s) de propriété ouverte(s).",
  "collector.overview.withCertificate":
    "{count} {units} avec certificat au dossier.",
  "collector.word.work": "œuvre",
  "collector.word.works": "œuvres",
  "collector.word.record": "fiche",
  "collector.word.records": "fiches",
  "collector.word.transfer": "transfert",
  "collector.word.transfers": "transferts",
  "collector.word.claim": "revendication",
  "collector.word.claims": "revendications",
  "collector.works.title": "Œuvres",
  "collector.works.order": "Ordre :",
  "collector.works.sortRecency": "Récence",
  "collector.works.sortValue": "Valeur déclarée",
  "collector.works.emptyPrefix": "Revendiquez la propriété depuis le",
  "collector.works.emptyLink": "registre",
  "collector.works.emptySuffix": "pour construire cette liste.",
  "collector.works.transferPending": "Transfert en attente",
  "collector.works.verificationOutstanding": "Vérification en suspens",
  "collector.attention.title": "Nécessite une attention",
  "collector.attention.empty": "Rien n'appelle à une action pour l'instant.",
  "collector.attention.verificationPending":
    "Vérification de propriété en attente : {title}",
  "collector.attention.transferResolve": "Transfert à résoudre : {title}",
  "collector.attention.claimInProgress": "Revendication de propriété en cours : {title}",
  "collector.fallback.collector": "Collectionneur",
  "collector.fallback.artist": "Artiste",
  "collector.fallback.untitled": "Sans titre",
  "collector.fallback.work": "Œuvre",
  "collector.activity.emptyHold":
    "L'activité apparaîtra lorsque vous détiendrez des œuvres.",
  "collector.activity.loading": "Chargement…",
  "collector.activity.noEvents":
    "Aucun événement récent dans votre collection.",
  "collector.activity.saleTransferPending": "Vente : transfert en attente",
  "collector.activity.valueRecorded": "Valeur enregistrée",
  "collector.activity.ownershipClaim": "Revendication de propriété",
  "collector.activity.ownershipUpdate": "Mise à jour de propriété",
  "collector.activity.verification": "Vérification",
  "collector.activity.untitledWork": "Œuvre sans titre",
  "collector.activity.detail": "{title} · {kind}",
  "collector.activity.detailWithStatus": "{title} · {kind} · {status}",
  "provenance.empty": "Pas encore de jalons de chronologie au dossier.",
  "provenance.chronology": "Chronologie",
  "provenance.fullChronology": "Chronologie complète",
  "provenance.currentRecord": "État actuel",
  "provenance.completeness.high": "Dossier stratifié",
  "provenance.completeness.moderate": "Dossier en croissance",
  "provenance.completeness.limited": "Dossier d'ouverture",
  "provenance.insight.noVerification": "Cette œuvre n'a pas de signaux de vérification.",
  "provenance.insight.ownershipUnverified": "La propriété actuelle n'est pas vérifiée.",
  "provenance.insight.saleIncomplete":
    "Vente enregistrée. Transfert de propriété incomplet.",
  "provenance.insight.fullyVerified": "Fiche entièrement vérifiée.",
  "provenance.insight.noRecentActivity": "Aucune activité récente enregistrée.",
  "about.journey.recordTitle": "Enregistrer",
  "about.journey.recordSubtitle": "Une identité de registre unique par œuvre",
  "about.journey.verifyTitle": "Vérifier",
  "about.journey.verifySubtitle": "Preuve cryptographique et horodatages immuables",
  "about.journey.certifyTitle": "Certifier",
  "about.journey.certifySubtitle": "Documents d'authenticité liés à la fiche",
  "about.journey.traceTitle": "Tracer",
  "about.journey.traceSubtitle": "Historique de propriété et de valeur",
  "about.journey.then": "puis",
  "provenance.event.registration": "Œuvre entrée au registre",
  "provenance.event.institutional": "Relation institutionnelle enregistrée",
  "provenance.event.custody": "Garde reflétée dans la chronologie",
  "provenance.chronologyIntro":
    "Les entrées s'accumulent ; les dépôts ultérieurs côtoient les précédents. Plusieurs participants apparaissent au fil des confirmations et étapes de garde.",
  "provenance.howFileReads": "Comment se lit le dossier",
  "provenance.continuityMarkers": "Marqueurs de continuité",
  "provenance.supportingMaterial": "Matériel justificatif joint",
  "provenance.certificateOnFile": "Certificat au dossier",
  "studio.search.byTitle": "Rechercher par titre…",
  "studio.search.artworks": "Rechercher des œuvres…",
  "studio.search.certificates": "Rechercher des certificats…",
  "studio.filter.artworks": "Filtrer les œuvres",
  "studio.filter.certificates": "Filtrer les certificats",
  "studio.filter.ownership": "Filtrer les fiches de propriété",
  "studio.filter.verifiedOnly": "Vérifiées uniquement",
  "studio.filter.notVerified": "Non vérifiées",
  "studio.filter.withDeclaredValue": "Avec valeur déclarée",
  "studio.filter.noDeclaredValue": "Sans valeur déclarée",
  "studio.registerArtwork": "Enregistrer une œuvre",
  "studio.artworks.noMatches": "Aucune œuvre ne correspond à votre recherche ou filtre.",
  "studio.artworks.verified": "Vérifiée",
  "studio.artworks.notVerified": "Non vérifiée",
  "studio.artworks.verifiedTooltip": "Vérifiée au dossier.",
  "studio.artworks.recordValue": "Enregistrer la valeur",
  "studio.artworks.noRecordId": "Pas d'ID de registre",
  "studio.artworks.emptyLabel": "Votre studio",
  "studio.artworks.emptyTitle": "Aucune œuvre représentée au dossier pour l'instant",
  "studio.certificates.all": "Tous les certificats",
  "studio.certificates.withImage": "Avec image de l'œuvre",
  "studio.certificates.withoutImage": "Sans image",
  "studio.certificates.noMatches": "Aucun certificat ne correspond à votre recherche ou filtre.",
  "studio.certificates.imagePlaceholder": "Fiche de registre",
  "studio.certificates.registryCertificate": "Certificat de registre",
  "studio.certificates.open": "Ouvrir →",
  "studio.certificates.emptyLabel": "Certificats de registre",
  "studio.certificates.emptyTitle": "Aucun certificat vérifié pour l'instant",
  "studio.ownership.filterAll": "Toutes les fiches ({count})",
  "studio.ownership.filterNeedsTransfer": "Transfert requis ({count})",
  "studio.ownership.filterSold": "Vendues ({count})",
  "studio.ownership.filterHeldByYou": "Sous votre garde ({count})",
  "studio.ownership.noMatches": "Aucune fiche de propriété ne correspond à votre recherche ou filtre.",
  "studio.ownership.noTransfers": "Aucun transfert pour l'instant",
  "studio.ownership.transferLedger": "{count} transfert au registre",
  "studio.ownership.transferLedgerPlural": "{count} transferts au registre",
  "studio.ownership.you": "Vous",
  "studio.ownership.unassigned": "Non attribué",
  "studio.ownership.collectorId": "Collectionneur ({id}…)",
  "studio.ownership.saleLogged": "Vente enregistrée : finaliser le transfert",
  "studio.ownership.lastEventSale": "Dernier événement · Vente",
  "studio.ownership.inYourCustody": "Sous votre garde",
  "studio.ownership.currentHolder": "Détenteur actuel",
  "studio.ownership.chainDepth": "Profondeur de chaîne",
  "studio.ownership.transfersOnRecord": "{count} transfert au dossier",
  "studio.ownership.transfersOnRecordPlural": "{count} transferts au dossier",
  "studio.ownership.noRegistryId": "Pas d'ID de registre",
  "studio.ownership.ledgerLink": "Registre →",
  "studio.ownership.emptyLabel": "Propriété",
  "studio.ownership.emptyTitle": "Aucune activité de propriété pour l'instant",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.saving": "Enregistrement…",
  "common.recording": "Enregistrement…",
  "common.processing": "Traitement…",
  "common.approve": "Approuver",
  "common.reject": "Refuser",
  "common.sending": "Envoi…",
  "common.ending": "Clôture…",
  "studio.hero.fallbackArtist": "Artiste",
  "studio.hero.catalogue": "Catalogue",
  "studio.hero.openArtworks": "Ouvrir les œuvres",
  "studio.hero.registeredInStudio": "Enregistrées au studio",
  "studio.hero.work": "œuvre",
  "studio.hero.works": "œuvres",
  "studio.hero.verifiedBadge": "{count} vérifiées",
  "studio.hero.pricedBadge": "{count} valorisées",
  "studio.hero.recordsToDeepen":
    "{count} fiche à authentifier et approfondir au dossier",
  "studio.hero.recordsToDeepenPlural":
    "{count} fiches à authentifier et approfondir au dossier",
  "studio.hero.amendmentNeedsResponse": "{count} modification attend votre réponse",
  "studio.hero.amendmentsNeedResponse": "{count} modifications attendent votre réponse",
  "studio.hero.recordHealth": "État du dossier",
  "studio.hero.certificates": "Certificats",
  "studio.hero.verified": "Vérifiées",
  "studio.hero.priced": "Valorisées",
  "studio.hero.publicStudio": "Studio public",
  "studio.hero.artistPage": "Page artiste",
  "studio.hero.notPublishedYet": "Pas encore publiée",
  "studio.hero.viewPublicPage": "Voir la page publique",
  "studio.hero.setupPresence": "Configurer la présence",
  "studio.hero.ownershipLedger": "Registre de propriété",
  "studio.hero.previewEmpty":
    "Enregistrez une œuvre pour voir l'aperçu du catalogue ici.",
  "studio.loading.opening": "Ouverture du studio…",
  "studio.form.title": "Titre",
  "studio.form.titleRequired": "Titre *",
  "studio.form.year": "Année",
  "studio.form.medium": "Medium",
  "studio.form.dimensions": "Dimensions",
  "studio.form.description": "Description",
  "studio.form.visibility": "Visibilité",
  "studio.form.image": "Image",
  "studio.form.imageRequired": "Image *",
  "studio.form.initialAmount": "Montant initial (optionnel)",
  "studio.form.currency": "Devise",
  "studio.form.eventType": "Type d'événement",
  "studio.form.visibilityPrivate": "Privé",
  "studio.form.visibilityGallery": "Galerie",
  "studio.form.visibilityPublic": "Public",
  "studio.form.visibilityCertificate": "Certificat",
  "studio.form.eventInitial": "Initial",
  "studio.form.eventPrimarySale": "Vente primaire",
  "studio.form.eventSecondarySale": "Vente secondaire",
  "studio.form.eventAppraisal": "Expertise",
  "studio.form.eventInternalEstimate": "Estimation interne",
  "studio.register.titleNew": "Enregistrer une nouvelle œuvre",
  "studio.register.titleGallery": "Enregistrer une œuvre",
  "studio.register.issueCanonical": "Émettre la fiche canonique",
  "studio.register.artistName": "Nom de l'artiste",
  "studio.register.asCreditedPlaceholder": "Tel que crédité sur l'œuvre",
  "studio.register.plainTextHint":
    "Le texte seul suffit. Un compte artiste n'est pas requis pour ouvrir la fiche canonique.",
  "studio.register.artistEmailOptional": "E-mail de l'artiste (optionnel)",
  "studio.register.emailInvitePlaceholder":
    "Pour une invitation ultérieure à authentifier et approfondir",
  "studio.register.linkRosterOptional": "Lier à un artiste du roster (optionnel)",
  "studio.register.noAccountLink": "Pas de lien de compte, nom au dossier seulement",
  "studio.register.placeholderTitle": "Titre de l'œuvre",
  "studio.register.placeholderYear": "2024",
  "studio.register.placeholderMedium": "Huile sur toile",
  "studio.register.placeholderDimensions": "122 × 91 cm",
  "studio.register.placeholderDescription": "Décrire l'œuvre…",
  "studio.register.placeholderAmount": "p. ex. 50000",
  "studio.artworkDetail.valueHistory": "Historique des valeurs",
  "studio.artworkDetail.noValueHistory": "Pas encore d'historique de valeur",
  "studio.valueEvent.title": "Enregistrer un événement de valeur",
  "studio.valueEvent.declaredAmount": "Montant déclaré",
  "studio.valueEvent.amountPlaceholder": "Montant",
  "studio.valueEvent.noteOptional": "Note (optionnelle)",
  "studio.valueEvent.notePlaceholder": "Contexte optionnel",
  "studio.valueEvent.helpAmount":
    "Le montant enregistré pour cet événement (valorisation, prix de vente, estimation, etc.). Correspondez à ce qui a été déclaré ou convenu.",
  "studio.valueEvent.helpCurrency":
    "Devise ISO pour le montant ci-dessus. Choisissez la devise de la citation, pas une conversion implicite.",
  "studio.valueEvent.helpEventTypes":
    "Initial : premier ancrage. Vente primaire : première vente depuis l'artiste ou le marché primaire. Vente secondaire : revente. Expertise : valorisation formelle. Estimation interne : référence du studio.",
  "studio.valueEvent.helpVisibility":
    "Privé : vous seul au studio. Galerie : contextes galerie. Certificat : couche certificat. Public : surfaces publiques du registre si la politique le permet.",
  "studio.valueEvent.helpNotes":
    "Contexte optionnel : foire, canal, type d'acheteur, expert, ou tout ce qui aide à interpréter l'événement plus tard.",
  "studio.overview.valueCoverage.title": "Valeur et couverture",
  "studio.overview.valueCoverage.subtitle":
    "Totaux et complétude de vos fiches de registre.",
  "studio.overview.totalValue": "Valeur totale",
  "studio.overview.totalValueCurrency": "Valeur totale ({currency})",
  "studio.overview.noPricedWorks": "Pas encore d'œuvres valorisées",
  "studio.overview.avgValueCurrency": "Valeur moy. ({currency})",
  "studio.overview.recordHealth": "État du dossier",
  "studio.overview.priced": "Valorisées",
  "studio.overview.pricedHint": "Œuvres avec valeur déclarée",
  "studio.overview.verifiedHint": "Vérifiées au registre",
  "studio.overview.locked": "Verrouillées",
  "studio.overview.lockedHint": "Immuables après vérification",
  "studio.overview.ownershipRequests.title": "Demandes de propriété",
  "studio.overview.ownershipRequests.subtitle":
    "Collectionneurs demandant reconnaissance. Examiner et répondre.",
  "studio.overview.noPendingClaims":
    "Aucune demande en attente. Quand un collectionneur soumet une demande, elle apparaît ici.",
  "studio.overview.pendingReview": "En attente d'examen",
  "studio.overview.claimant": "Demandeur",
  "studio.overview.valueProgression.title": "Progression des valeurs",
  "studio.overview.valueProgression.subtitle":
    "Comment les valeurs évoluent de l'initial au dernier comparable.",
  "studio.overview.avgChange": "Variation moyenne",
  "studio.overview.avgChangeHint":
    "Variation % moyenne quand initial et dernier partagent une devise.",
  "studio.overview.worksIncreased": "Œuvres en hausse",
  "studio.overview.decliningWorks": "Œuvres en baisse",
  "studio.overview.noProgressionData": "Pas encore de données de progression",
  "studio.overview.valueChange": "Variation de valeur",
  "studio.overview.ownershipIntel.title": "Intelligence propriété",
  "studio.overview.ownershipIntel.subtitle":
    "Transferts, détentions et mouvement dans votre catalogue.",
  "studio.overview.totalTransfers": "Transferts totaux",
  "studio.overview.worksYouHold": "Œuvres que vous détenez",
  "studio.overview.avgHoldDays": "Détention moy. (jours)",
  "studio.overview.catalogueHighlights.title": "Points saillants du catalogue",
  "studio.overview.catalogueHighlights.subtitle":
    "Fiches remarquables de votre activité au registre.",
  "studio.overview.mostTransferred": "Plus transférée",
  "studio.overview.mostTransferredHint": "Nombre de transferts le plus élevé.",
  "studio.overview.longestHeld": "Plus longue détention",
  "studio.overview.longestHeldHint":
    "Plus long intervalle entre premier et dernier transfert.",
  "studio.overview.fastestAppreciating": "Plus forte plus-value",
  "studio.overview.fastestAppreciatingHint":
    "Plus grand gain % de l'initial au dernier (même devise).",
  "studio.records.noAwaitingAttestation":
    "Aucune fiche n'attend votre attestation. Quand une fiche canonique est associée à votre pratique, elle apparaît ici pour authentifier et approfondir.",
  "studio.records.institutionalRelationship": "Relation institutionnelle",
  "studio.records.relationshipOnFile": "Relation au dossier",
  "studio.records.endOnFile": "Clore au dossier",
  "studio.records.linkedWith": "Lié à {name}.",
  "studio.records.linkVisibleAfterEnding":
    "Votre lien institutionnel reste visible sur les dépôts antérieurs après clôture.",
  "representation.canonicalRecordOnFile": "Fiche d'œuvre canonique au dossier",
  "representation.recordDeepensOverTime":
    "La fiche s'approfondit au fil des contributions des participants",
  "representation.institutionAttestationOnFile":
    "Continuité liée à l'institution au dossier",
  "representation.priorContributionsRemainVisible":
    "Les contributions antérieures restent visibles dans la chronologie",
  "representation.historicalInstitutionLayer":
    "La participation institutionnelle historique reste au dossier",
  "representation.inviteRecordExists":
    "Une fiche canonique associée à votre pratique est déjà au dossier",
  "representation.notApprovalWorkflow":
    "Attestations en couches uniquement, pas d'arbitrage de propriété ni d'approbation institutionnelle",
  "representation.representationOnFile": "Relation institutionnelle au dossier",
  "representation.priorFilingsRemainVisible":
    "Les contributions antérieures restent visibles dans la chronologie",
  "representation.amendmentPendingReview": "Modification ouverte au dossier",
  "studio.records.deepen.eyebrow": "Fiches canoniques",
  "studio.records.deepen.title": "Authentifier et approfondir",
  "studio.records.deepen.description":
    "{inviteRecordExists}. {recordDeepensOverTime}. Vous apportez des attestations. L'œuvre n'est pas provisoire et vous n'approuvez pas un dépôt institutionnel.",
  "studio.records.deepen.badge": "{count} fiche à approfondir",
  "studio.records.deepen.badgePlural": "{count} fiches à approfondir",
  "studio.records.deepen.step1":
    "Examiner la fiche canonique telle qu'elle figure au dossier",
  "studio.records.deepen.step2": "Authentifier la paternité comme votre attestation",
  "studio.records.deepen.step3":
    "Déposer une contribution d'auteur archivistique dans la chronologie",
  "studio.records.deepen.step4":
    "Reconnaître éventuellement la relation institutionnelle sur la fiche",
  "studio.records.deepen.opened": "Ouverte {when}",
  "studio.records.deepen.reviewAuthenticate": "Examiner et authentifier",
  "studio.records.deepen.publicRecord": "Fiche publique",
  "studio.records.deepen.contributeAuthorship": "Contribuer à la paternité",
  "studio.records.deepen.authenticateAuthorship": "Authentifier la paternité",
  "studio.records.deepen.institution": "Institution",
  "studio.amendments.eyebrow": "Modifications de représentation",
  "studio.amendments.title": "Mises à jour de la chronique",
  "studio.amendments.description":
    "Les affinements proposés restent provisoires jusqu'à acceptation par la contrepartie au dossier. Les attestations antérieures restent visibles : chronologie cumulative, pas de remplacement.",
  "studio.amendments.responseNeeded": "1 réponse requise",
  "studio.amendments.responsesNeeded": "{count} réponses requises",
  "studio.amendments.newRequest": "Nouvelle demande de modification",
  "studio.amendments.empty": "Aucune demande de modification au dossier pour l'instant.",
  "studio.amendments.workFallback": "Œuvre",
  "studio.amendments.institution": "Institution",
  "studio.amendments.representedArtist": "Artiste représenté",
  "studio.amendments.roleArtist": "Artiste",
  "studio.amendments.roleInstitution": "Institution",
  "studio.amendments.initiated": "initiée",
  "studio.amendments.statusAccepted": "Acceptée au dossier",
  "studio.amendments.statusDeclined": "Refusée",
  "studio.amendments.statusWithdrawn": "Retirée",
  "studio.amendments.resolution": "Décision :",
  "studio.amendments.viewPublicRecord": "Voir la fiche publique",
  "studio.amendments.responseNote": "Note de réponse",
  "studio.amendments.responsePlaceholder": "Note de réponse (optionnelle)",
  "studio.amendments.acceptOnFile": "Accepter au dossier",
  "studio.amendments.decline": "Refuser",
  "studio.amendments.withdrawRequest": "Retirer la demande",
  "studio.amendments.modalTitle": "Nouvelle demande de modification",
  "studio.amendments.chooseWork": "Choisissez une œuvre.",
  "studio.amendments.noteRequired":
    "Ajoutez une note décrivant la modification proposée.",
  "studio.amendments.noteDescribe":
    "Décrivez ce qui doit changer. Les champs catalogue optionnels ne s'appliquent que si la contrepartie accepte.",
  "studio.amendments.requestFailed": "La demande n'a pas pu être envoyée.",
  "studio.amendments.submitRequest": "Envoyer la demande",
  "studio.authorship.title": "Approfondir la fiche",
  "studio.authorship.workFallback": "Œuvre au dossier",
  "studio.authorship.statement": "Déclaration de paternité",
  "studio.authorship.statementPlaceholder":
    "Comment vous comprenez la paternité de cette œuvre : pratique, intention ou contexte documentaire…",
  "studio.authorship.chronology": "Contribution à la chronologie",
  "studio.authorship.chronologyPlaceholder":
    "Dates, contexte de production, historique d'exposition ou continuité souhaitée au dossier…",
  "studio.authorship.filing": "Dépôt en cours…",
  "studio.authorship.fileContribution": "Déposer la contribution dans la chronologie",
  "studio.endRepresentation.title": "Clore la représentation au dossier",
  "studio.endRepresentation.noteOptional": "Note (optionnelle)",
  "studio.endRepresentation.notePlaceholder":
    "p. ex. changement de roster, contrat conclu…",
  "studio.endRepresentation.acknowledge":
    "Je comprends que les dépôts institutionnels antérieurs et les entrées de chronologie restent visibles sur la fiche publique.",
  "studio.toast.verificationRequestFailed":
    "La demande de vérification n'a pas pu être enregistrée.",
  "studio.toast.verificationRequestRecorded":
    "Demande de vérification enregistrée au dossier.",
  "studio.toast.sessionEnded":
    "Session terminée. Reconnectez-vous pour continuer.",
  "studio.toast.verificationIncomplete": "La vérification n'est pas terminée.",
  "studio.toast.custodyVerified": "Étape de garde vérifiée dans la chronologie.",
  "studio.toast.connectionInterrupted":
    "Connexion interrompue. Reconnectez-vous, puis rouvrez le studio.",
  "studio.toast.contributionFailed": "Impossible de déposer la contribution.",
  "studio.toast.contributionFiled":
    "Contribution d'auteur déposée dans la chronologie.",
  "studio.toast.contributionError": "Impossible de déposer la contribution.",
  "studio.toast.confirmFailed": "Impossible de confirmer.",
  "studio.toast.confirmRecorded": "Confirmation enregistrée au dossier.",
  "studio.toast.confirmError": "Impossible de confirmer.",
  "studio.toast.amendmentResolveFailed": "Impossible de traiter la modification.",
  "studio.toast.amendmentAccepted": "Modification acceptée au dossier.",
  "studio.toast.amendmentDeclined": "Modification refusée au dossier.",
  "studio.toast.amendmentResolveError": "Impossible de traiter la modification.",
  "studio.toast.withdrawFailed": "Impossible de retirer.",
  "studio.toast.amendmentWithdrawn": "Modification retirée au dossier.",
  "studio.toast.withdrawError": "Impossible de retirer.",
  "studio.toast.endRepresentationFailed":
    "Impossible de clore la représentation.",
  "studio.toast.representationEnded": "Représentation close au dossier.",
  "studio.toast.endRepresentationError":
    "Impossible de clore la représentation.",
  "studio.toast.amendmentRequestFiled":
    "Demande de modification déposée dans la chronologie.",
  "studio.toast.activityLogFailed":
    "Le journal d'activité n'a pas pu être écrit. L'action peut quand même être au dossier.",
  "studio.toast.claimApproveFailed": "La demande n'a pas pu être approuvée.",
  "studio.toast.custodyLedgerFailed": "Impossible d'ouvrir le registre de garde.",
  "studio.toast.custodyRowUpdateFailed":
    "La ligne de garde n'a pas pu être mise à jour.",
  "studio.toast.custodyRowRecordFailed":
    "La ligne de garde n'a pas pu être enregistrée.",
  "studio.toast.claimRecorded": "Demande de propriété enregistrée dans la chronologie.",
  "studio.toast.claimWithdrawFailed": "La demande n'a pas pu être retirée.",
  "studio.toast.claimWithdrawn": "Demande retirée de l'examen.",
  "studio.toast.registerFailed": "L'œuvre n'a pas pu être enregistrée au dossier.",
  "studio.toast.valueFilingFailed": "La valeur n'a pas pu être enregistrée.",
  "studio.toast.valueEventRecorded": "Événement de valeur enregistré au dossier.",
  "studio.toast.buyerUuidInvalid":
    "L'identifiant du compte acheteur doit être un UUID.",
  "studio.toast.buyerIdRequired": "L'identifiant du compte acheteur est requis.",
  "studio.toast.buyerNameRequired":
    "Le nom de l'acheteur est requis pour ce dépôt.",
  "studio.toast.recordingTransfer": "Enregistrement du transfert au dossier…",
  "studio.toast.transferFailed": "Le transfert n'a pas pu être déposé : {error}",
  "studio.toast.transferOwnerUpdateFailed":
    "Transfert enregistré ; le détenteur actuel n'a pas pu être mis à jour automatiquement.",
  "studio.toast.transferContinued":
    "Chronologie poursuivie pour ce transfert.",
  "studio.ledger.saleRecorded": "Vente enregistrée",
  "studio.ledger.completeTransfer":
    "Finalisez le transfert de propriété pour une provenance exacte.",
  "studio.ledger.recordTransferDetails": "Enregistrer les détails du transfert",
  "studio.ledger.transferDetails": "Détails du transfert",
  "studio.ledger.sellerPrefilled": "Vendeur (prérempli)",
  "studio.ledger.sellerUserIdPlaceholder": "ID utilisateur vendeur",
  "studio.ledger.buyer": "Acheteur",
  "studio.ledger.externalBuyer": "Acheteur externe",
  "studio.ledger.existingUser": "Utilisateur existant",
  "studio.ledger.buyerUserIdPlaceholder": "ID utilisateur acheteur (UUID)",
  "studio.ledger.buyerNamePlaceholder": "Nom de l'acheteur",
  "studio.ledger.buyerType.collector": "Collectionneur",
  "studio.ledger.buyerType.gallery": "Galerie",
  "studio.ledger.buyerType.institution": "Institution",
  "studio.ledger.buyerType.private": "Privé",
  "studio.ledger.buyerType.unknown": "Inconnu",
  "studio.ledger.externalBuyerNote": "Les acheteurs externes n'ont pas besoin de compte.",
  "studio.ledger.saleType": "Type de vente",
  "studio.ledger.saleTypePrimary": "Primaire",
  "studio.ledger.saleTypeSecondary": "Secondaire",
  "studio.ledger.dateOfSale": "Date de vente",
  "studio.ledger.notes": "Notes",
  "studio.ledger.notesPlaceholder": "Contexte optionnel (facture, lieu, etc.)",
  "studio.ledger.saveTransfer": "Enregistrer le transfert",
  "studio.ledger.title": "Registre de propriété",
  "studio.ledger.artworkFallback": "Œuvre",
  "studio.ledger.valueHistorySubtitle":
    "Chaque événement de valeur déclarée pour cette œuvre.",
  "studio.ledger.noValueEvents": "Aucun événement de valeur enregistré.",
  "studio.ledger.noAdditionalContext": "Aucun contexte supplémentaire",
  "studio.ledger.visibility": "Visibilité",
  "studio.ledger.ownershipHistory": "Historique de propriété",
  "studio.ledger.ownershipHistorySubtitle":
    "Chaque transfert et confirmation pour cette œuvre.",
  "studio.ledger.noOwnershipEvents": "Aucun événement de propriété enregistré.",
  "studio.ledger.currentOwner": "Détenteur actuel",
  "studio.ledger.claimedByYou": "Vous avez revendiqué la propriété",
  "studio.ledger.claimedByOther":
    "Propriété revendiquée par un autre collectionneur",
  "studio.ledger.from": "De",
  "studio.ledger.requestVerification": "Demander une vérification",
  "studio.ledger.submitting": "Envoi…",
  "studio.ledger.verifyOwnership": "Vérifier la propriété",
  "studio.ledger.verifying": "Vérification…",
  "studio.ledger.integrityNotes": "Notes d'intégrité",
  "studio.ledger.integritySubtitle":
    "Les anomalies ou situations particulières du parcours de propriété apparaissent ici.",
  "studio.ledger.noIntegrityData": "Aucune donnée d'intégrité disponible.",
  "studio.ledger.integrityEventOn": "{type} le {date}",
  "studio.ledger.unknownOwner": "Propriétaire inconnu",
  "studio.ledger.unknown": "Inconnu",
  "studio.ledger.status.verified": "Détenu (vérifié)",
  "studio.ledger.status.claimed": "Propriété revendiquée",
  "studio.ledger.status.unassigned": "Non attribué",
  "studio.ledger.status.recorded": "Propriété enregistrée",
  "studio.ledger.valueType.sale": "Vente enregistrée",
  "studio.ledger.valueType.auction": "Vente aux enchères enregistrée",
  "studio.ledger.transferType.transfer": "Transfert de propriété",
  "studio.ledger.transferType.initial": "Enregistrement initial",
  "studio.ledger.transferType.correction": "Mise à jour de la fiche",
  "studio.ledger.transferType.sale": "Vente",
  "studio.ledger.confirm.areYouSure": "Voulez-vous vraiment continuer ?",
  "studio.ledger.confirm.working": "Traitement…",
  "studio.ledger.confirm.adminVerify.title": "Vérifier cette étape de propriété ?",
  "studio.ledger.confirm.adminVerify.body":
    "Vous allez marquer ce transfert de propriété comme vérifié. Vous indiquez au registre que ce changement de mains est correct et doit figurer comme historique fiable.\n\nContinuez seulement si vous avez vérifié les détails de vente ou de transfert.",
  "studio.ledger.confirm.adminVerify.confirm": "Oui, vérifier la propriété",
  "studio.ledger.confirm.requestVerification.title":
    "Demander une vérification pour ce transfert ?",
  "studio.ledger.confirm.requestVerification.body":
    "Vous demandez de faire avancer cette étape dans le processus de vérification. La demande fait partie de l'histoire de provenance.\n\nUtilisez ceci lorsque vous estimez les détails corrects et souhaitez un examen.",
  "studio.ledger.confirm.requestVerification.confirm": "Oui, envoyer la demande",
  "studio.insight.fallbackTitle": "Aperçu",
  "studio.insight.loadingSeries": "Récupération de la série au dossier…",
  "studio.insight.noSeriesData": "Aucune donnée de série pour cette période.",
  "studio.insight.howToRead": "Comment lire ceci",
  "studio.insight.breakdownHeading": "Détail",
  "studio.insight.notesHeading": "Notes",
  "studio.insight.defaultValueLabel": "Valeur",
  "studio.insight.loadFailed":
    "Impossible de charger cet aperçu. Réessayez.",
  "studio.insight.title.worksArtist": "Points saillants du catalogue",
  "studio.insight.title.worksGallery": "Catalogue dans le temps",
  "studio.insight.title.health": "Santé des fiches",
  "studio.insight.title.valueArtist": "Progression des valeurs",
  "studio.insight.title.valueGallery": "Valeur déclarée",
  "studio.insight.line.worksArtist": "Œuvres",
  "studio.insight.line.worksGallery": "Œuvres cumulées",
  "studio.insight.breakdown.totalWorks": "Total des œuvres",
  "studio.insight.breakdown.uniqueWorks": "Œuvres uniques",
  "studio.insight.breakdown.unique": "Uniques",
  "studio.insight.breakdown.editionWorks": "Œuvres en édition",
  "studio.insight.breakdown.editions": "Éditions",
  "studio.insight.breakdown.mostActivePeriod": "Période la plus active",
  "studio.insight.breakdown.peakPeriod": "Période de pointe",
  "studio.insight.breakdown.fullyVerifiedStrict": "Entièrement vérifié (strict)",
  "studio.insight.breakdown.withCertificate": "Avec certificat",
  "studio.insight.breakdown.missingVerification": "Vérification manquante",
  "studio.insight.breakdown.latestDeclared": "Dernière déclaration ({currency})",
  "studio.insight.bar.fullyVerified": "Entièrement vérifié",
  "studio.insight.bar.certified": "Certifié",
  "studio.insight.bar.incomplete": "Incomplet",
  "studio.insight.note.healthNonAdditive":
    "Ces barres ne sont pas additives : une œuvre peut compter dans plusieurs catégories.",
  "studio.insight.note.healthStrictArtist":
    "« Entièrement vérifié » exige un certificat non révoqué, une attestation de galerie et une propriété vérifiée. Cette barre est plus stricte que le badge « vérifié » par ligne dans votre studio.",
  "studio.insight.note.healthStrictGallery":
    "« Entièrement vérifié » exige un certificat non révoqué, une attestation de galerie et une propriété vérifiée. Cette barre est plus stricte que le badge « vérifié » sur chaque œuvre.",
  "studio.insight.note.valueBasisArtist":
    "Les chiffres sont la dernière valeur déclarée par devise de vos événements de valeur (même base que la série du graphique), pas un cumul de tous les prix courants.",
  "studio.insight.note.valueBasisGallery":
    "Les chiffres sont la dernière valeur déclarée par devise des événements de valeur (même base que la série du graphique), pas un cumul de tous les prix courants.",
  "studio.insight.subtitle.artist.catalogueSteadyGrowth":
    "Le catalogue a progressé de façon régulière.",
  "studio.insight.subtitle.artist.clearOwnership":
    "Le catalogue montre une fiche de propriété claire.",
  "studio.insight.subtitle.artist.ownershipPending":
    "Une continuité de propriété est encore en attente au dossier.",
  "studio.insight.subtitle.artist.continuityNeeded":
    "Certaines œuvres peuvent nécessiter une continuité enregistrée pour compléter la fiche.",
  "studio.insight.subtitle.artist.valuesShifted":
    "Les dernières valeurs enregistrées ont évolué par rapport aux périodes antérieures.",
  "studio.insight.subtitle.artist.valuesSteady":
    "Les dernières valeurs enregistrées sont stables par rapport aux entrées antérieures.",
  "studio.insight.subtitle.artist.multiCurrencyTracked":
    "Les valeurs sont suivies dans plusieurs devises.",
  "studio.insight.subtitle.artist.addValueEvent":
    "Ajoutez un événement de valeur pour voir la progression ici.",
  "studio.insight.subtitle.artist.value.noEvents12mo":
    "Aucun événement de valeur au cours des 12 derniers mois.",
  "studio.insight.subtitle.artist.value.multiCurrency":
    "Les valeurs sont suivies dans plusieurs devises ; chaque ligne utilise sa propre échelle.",
  "studio.insight.subtitle.artist.value.trendingUp":
    "Les dernières valeurs enregistrées sont en hausse par rapport aux entrées antérieures.",
  "studio.insight.subtitle.artist.value.softened":
    "Les dernières valeurs enregistrées ont diminué par rapport aux entrées antérieures.",
  "studio.insight.subtitle.artist.value.steady":
    "Les dernières valeurs enregistrées sont stables par rapport aux entrées antérieures.",
  "studio.insight.subtitle.gallery.registrySteady":
    "L'activité du registre est régulière sur vos œuvres représentées.",
  "studio.insight.subtitle.gallery.ownershipPending":
    "Une continuité de propriété est encore en attente au dossier.",
  "studio.insight.subtitle.gallery.verificationSteady":
    "L'activité de vérification est régulière dans votre studio.",
  "studio.insight.subtitle.gallery.recordsPending":
    "Certaines fiches sont encore en attente au dossier.",
  "studio.insight.subtitle.gallery.value.noDeclared":
    "Aucune valeur déclarée dans cette fenêtre pour les œuvres représentées.",
  "studio.insight.subtitle.gallery.value.multiCurrency":
    "Les valeurs déclarées couvrent plusieurs devises dans votre studio.",
  "studio.insight.subtitle.gallery.value.trendingUp":
    "Les dernières valeurs déclarées sont en hausse dans votre studio.",
  "studio.insight.subtitle.gallery.value.softened":
    "Les dernières valeurs déclarées ont diminué sur les périodes récentes.",
  "studio.insight.subtitle.gallery.value.steady":
    "Les valeurs déclarées sont stables sur les périodes récentes.",
  "studio.insight.subtitle.collector.ownershipPending":
    "Une continuité de propriété est encore en attente au dossier.",
  "studio.insight.subtitle.collector.ownershipEstablished":
    "Les fiches de propriété sont bien établies.",
  "studio.insight.subtitle.collector.multiCurrency":
    "La collection est enregistrée dans plusieurs devises.",
  "studio.insight.subtitle.collector.consistentRecord":
    "La collection montre une fiche cohérente dans le temps.",
  "studio.insight.subtitle.collector.value.noEvents":
    "Aucune valeur enregistrée dans cette fenêtre.",
  "studio.insight.subtitle.collector.value.multiCurrency":
    "Votre collection couvre plusieurs devises.",
  "studio.insight.subtitle.collector.value.trendingUp":
    "Les dernières valeurs enregistrées sont en hausse.",
  "studio.insight.subtitle.collector.value.softened":
    "Les dernières valeurs enregistrées ont diminué.",
  "studio.insight.subtitle.collector.value.steady":
    "Les valeurs enregistrées restent stables.",
  "studio.activity.artworkRegistered": "Œuvre enregistrée : {title}",
  "studio.activity.valueUpdated": "Valeur mise à jour : {title}",
  "studio.activity.ownershipConfirmed": "Propriété confirmée : {title}",
  "studio.activity.ownershipClaimRejected": "Revendication de propriété rejetée",
  "studio.activity.authInviteSent":
    "Invitation d'authentification envoyée pour {title}{registrySuffix} à {email}",
  "studio.activity.authenticatedAuthorship":
    "Paternité authentifiée : {title}{registrySuffix}",
  "studio.activity.representationConfirmed":
    "Représentation confirmée : {title}{registrySuffix}",
  "studio.activity.provenanceInitiated":
    "Transfert de continuité initié : {title}{registrySuffix} → {recipient}",
  "studio.activity.provenanceAccepted":
    "Transfert de continuité accepté : {title}{registrySuffix}",
  "studio.activity.provenanceCompleted":
    "Transfert de continuité terminé : {title}{registrySuffix}",
  "studio.activity.galleryInviteSent":
    "Invitation de représentation envoyée à {email}",
  "studio.activity.accountDeletionRequested":
    "Suppression de compte demandée pour {email}",
  "studio.activity.artworkVerified": "Œuvre vérifiée : {title}{registrySuffix}",
  "studio.activity.certificateIssued": "Certificat émis : {title}{registrySuffix}",
  "studio.activity.artistOnboarded":
    "{artist} a terminé l'intégration au registre pour {gallery}.",
  "studio.activity.personalArchiveAdded":
    "Ajouté à l'archive personnelle : {title}{registrySuffix}",
  "studio.activity.personalArchiveRemoved":
    "Retiré de l'archive personnelle : {title}{registrySuffix}",
  "studio.activity.collectorOwnershipDeclared":
    "Déclaration de propriété enregistrée : {title}{registrySuffix}",
  "studio.activity.galleryInviteAccepted": "Invitation galerie acceptée",
  "studio.activity.unknown": "Activité enregistrée",
  "registry.record.certificateOverview": "Aperçu du certificat",
};

const JA: Record<MessageKey, string> = {
  ...EN,
  "common.perMonth": "月額",
  "nav.registry": "レジストリ",
  "nav.field": "The Field",
  "nav.about": "概要",
  "nav.signIn": "サインイン",
  "nav.takePart": "参加する",
  "nav.myAccount": "マイアカウント",
  "nav.stewardship": "Studio",
  "nav.signOut": "サインアウト",
  "nav.account": "アカウント",
  "nav.regionLabel": "地域と言語",
  "ecosystem.role.creative": "クリエイティブ",
  "ecosystem.role.organisation": "組織",
  "ecosystem.role.collector": "コレクター",
  "ecosystem.surface.studio": "Studio",
  "ecosystem.surface.field": "The Field",
  "ecosystem.surface.registry": "レジストリ",
  "field.home.title": "公開の発見とプレゼンス",
  "field.home.lede":
    "The Field は、Creative、Organisation、レジストリレコードを閲覧する公開レイヤーです。参加者が公開を選んだ内容を読み取り専用で表示します。編集と管理は Studio で行います。",
  "field.home.explorerHeading": "エクスプローラー",
  "field.home.explorerBody":
    "Creative、Organisation、レジストリレコードの3つの索引ビュー。フィルターとページネーション付き。おすすめや有料ランキングはありません。",
  "field.home.verifyHeading": "検証",
  "field.home.verifyBody":
    "レジストリ ID から、レコードの検証および証明書ステータスを確認できます。",
  "field.home.verifyLink": "検証入口を開く",
  "field.home.registryNote":
    "レジストリは記録の正本です。The Field は読み取り専用で参照し、Studio でレコードとプロフィールを管理します。",
  "field.explorer.subNavLabel": "Field エクスプローラー",
  "field.explorer.tab.creatives": "Creatives",
  "field.explorer.tab.organisations": "Organisations",
  "field.explorer.tab.records": "Records",
  "field.explorer.hub.title": "エクスプローラー",
  "field.explorer.creatives.headline": "Creative を探す",
  "field.explorer.creatives.lede":
    "The Field 上の公開 Creative プロフィールを閲覧 — プラクティス、検証、レジストリの footprint。発見のみ。",
  "field.explorer.creatives.searching": "検索",
  "field.explorer.creatives.filtered": "フィルター適用中",
  "field.explorer.creatives.filter.search": "名前で検索",
  "field.explorer.creatives.filter.searchPlaceholder": "名前…",
  "field.explorer.creatives.filter.practice": "プラクティス",
  "field.explorer.creatives.filter.allPractices": "すべて",
  "field.explorer.creatives.filter.verification": "検証",
  "field.explorer.creatives.filter.allCreatives": "すべての Creative",
  "field.explorer.creatives.filter.verifiedOnly": "記録上 verified",
  "field.explorer.creatives.filter.verifiedHint":
    "検証済みレジストリレコードまたは artist 確認が記録上にある Creative。",
  "field.explorer.creatives.filter.sort": "並び替え",
  "field.explorer.creatives.filter.apply": "適用",
  "field.explorer.creatives.sort.nameAsc": "名前 A–Z",
  "field.explorer.creatives.sort.nameDesc": "名前 Z–A",
  "field.explorer.creatives.sort.recent": "最近更新",
  "field.explorer.creatives.empty.none":
    "公開 Creative はまだありません。Studio でプロフィールを有効にできます。",
  "field.explorer.creatives.empty.filtered":
    "条件に一致する Creative がありません。",
  "field.explorer.creatives.empty.clearFilters": "フィルターをクリア",
  "field.stub.preparing":
    "このルートは Phase 2A 向けに用意されています。コンテンツとデータは次の PR1 ステップで提供されます。",
  "field.stub.backHome": "The Field に戻る",
  "field.verify.title": "検証",
  "field.verify.record.title": "レコード検証",
  "field.verify.hub.title": "レジストリレコードを検証",
  "field.verify.hub.lede":
    "The Field はレジストリ台帳から信頼を表示します。The Field は検証を発行せず、レジストリの真実を読み取ります。",
  "field.verify.hub.lookupHeading": "Registry ID で確認",
  "field.verify.hub.lookupIntro":
    "レコードまたは証明書の Registry ID を入力して、公開検証ステータスを表示します。",
  "field.verify.hub.lookupLabel": "Registry ID",
  "field.verify.hub.lookupPlaceholder": "例: RROWM-…",
  "field.verify.hub.lookupSubmit": "ステータスを確認",
  "field.verify.hub.lookupHint":
    "公開ステータスのみ。完全な証明書はサインインが必要です。",
  "field.verify.hub.lookupRequired": "Registry ID を入力してください。",
  "field.verify.hub.hierarchyTitle": "信頼シグナルの順序",
  "field.verify.hub.hierarchyIntro":
    "The Field ではこの順序でシグナルを読みます。台帳の事実がプロフィール叙述より優先されます。",
  "field.verify.hub.tier1.label": "第1層 — レジストリレコード",
  "field.verify.hub.tier1.body":
    "Registry ID、レコード検証ステータス、artist 確認。",
  "field.verify.hub.tier2.label": "第2層 — Organisation と verified 作品",
  "field.verify.hub.tier2.body":
    "Organisation の verified バッジと verified 作品数 — 人気スコアではありません。",
  "field.verify.hub.tier3.label": "第3層 — 証明書",
  "field.verify.hub.tier3.body":
    "verified レコードに対する証明書の記録または失効。",
  "field.verify.hub.section.verification.title": "検証とは",
  "field.verify.hub.section.verification.body":
    "検証は、定義された確認が記録上にあるというレジストリの証明です — 台帳に基づきます。",
  "field.verify.hub.section.provenance.title": "来歴（provenance）とは",
  "field.verify.hub.section.provenance.body":
    "来歴はレコードの時系列の連続性 — 記録上で確認されたイベントです。",
  "field.verify.hub.section.registryRecord.title": "レジストリレコードとは",
  "field.verify.hub.section.registryRecord.body":
    "レジストリレコードは作品の正規の連続性エントリです。The Field は読み取り専用の表面です。",
  "field.verify.hub.section.howVerification.title": "検証の仕組み",
  "field.verify.hub.section.howVerification.body":
    "参加者は Studio で管理し、ステータスはレジストリに書き込まれます。The Field は read-only で表示します。",
  "field.verify.hub.section.certificates.title": "証明書の仕組み",
  "field.verify.hub.section.certificates.body":
    "レコード verified 後、証明書が記録される場合があります。公開検証はステータスのみ。文書はサインイン後。",
  "field.verify.hub.linkRecords": "レジストリレコードを閲覧",
  "field.presence.creative.title": "Creative プロフィール",
  "field.presence.organisation.title": "Organisation プロフィール",
  "field.presence.collector.title": "コレクタープロフィール",
  "field.record.title": "レジストリレコード",
  "ecosystem.workspace.studio": "Studio",
  "ecosystem.workspace.organisationStudio": "組織 Studio",
  "getStarted.pathTooltip":
    "各パスは参加者タイプに合った Studio ワークスペースを開きます。その下で、作品ごとに一つの年表がレジストリに記録されます。",
  "account.hero.organisationIdentity": "組織アイデンティティ",
  "account.profile.organisationProfile": "組織プロフィール",
  "account.profile.publicProfileHint": "公開プロフィールに表示される略歴とリンク。",
  "footer.navigate": "ナビゲーション",
  "footer.access": "アクセス",
  "footer.legal": "法的情報",
  "footer.social": "ソーシャル",
  "footer.registry": "レジストリ",
  "footer.field": "The Field",
  "footer.about": "概要",
  "footer.contact": "お問い合わせ",
  "footer.signIn": "サインイン",
  "footer.register": "登録",
  "footer.account": "アカウント",
  "footer.privacy": "プライバシー",
  "footer.terms": "利用規約",
  "footer.disclaimer": "免責事項",
  "footer.tagline": "レジストリ · 文書 · 制度的記録",
  "footer.copyright": "無断転載を禁じます。",
  "footer.regionLabel": "地域と言語",
  "footer.blurb":
    "現代美術のための暗号学的に検証可能なレジストリ。作者性と来歴を保護します。",
  "landing.hero.title": "文化の記憶のためのインフラ",
  "landing.hero.lede":
    "現代文化作品のための信頼できる来歴レジストリ。作者性、所有、歴史的記録を、進化する単一のアーカイブで結びつけます。",
  "landing.hero.browseCatalogue": "公開ギャラリーを見る",
  "landing.hero.takePart": "参加する",
  "landing.hero.overview": "概要",
  "landing.cta.title": "作品の連続性に参加する",
  "landing.cta.takePart": "参加する →",
  "landing.cta.browseRegistry": "レジストリを見る",
  "landing.thesis.title": "連続性は作品と共にあり、ファイルに散らばらない",
  "landing.thesis.card1Title": "現在の記録",
  "landing.thesis.card1Body": "作品ごとに一つのカタログエントリ。今日照合する一覧です。",
  "landing.thesis.card2Title": "記録上の年表",
  "landing.thesis.card2Body":
    "マイルストーンは順に蓄積され、後の提出は以前のものと並びます。",
  "landing.thesis.card3Title": "参加者の役割",
  "landing.thesis.card3Body":
    "機関の関連付けとコレクターのスタジオ活動は、参加者が提出した場所に表示されます。",
  "landing.flow.title": "最初の掲載から次へ、作品の一本の糸",
  "landing.flow.s1Label": "作品を名付ける",
  "landing.flow.s1Detail":
    "一度リスト化。アーティスト、ギャラリー、コレクターが戻れる永続的な ID を得ます。",
  "landing.flow.s2Label": "重要なものを添付",
  "landing.flow.s2Detail":
    "証明書、ギャラリー関連、保管メモ。すべて同じエントリに集約されます。",
  "landing.flow.s3Label": "現在を明確に",
  "landing.flow.s3Detail":
    "今日公開されているものは読みやすく。非公開はサインインの内側に留まります。",
  "landing.flow.s4Label": "糸を伸ばす",
  "landing.flow.s4Detail":
    "売却、移転、展示のたびに、同じ物語に順序立てて一行が加わります。",
  "landing.workspace.title": "保有が記録に残る場所",
  "landing.workspace.takePart": "参加する",
  "landing.workspace.viewPublic": "公開レイヤーを見る",
  "landing.portfolio.title": "すべての役割でポートフォリオ管理",
  "getStarted.title": "参加方法を選ぶ",
  "getStarted.alreadyAccount": "すでにアカウントをお持ちですか？",
  "getStarted.signIn": "サインイン",
  "getStarted.roleNote": "役割はプロフィールに従い、このページだけでは決まりません。",
  "getStarted.artistTitle": "クリエイティブです",
  "getStarted.artistDesc":
    "作品を登録し、カタログ上の存在、年表、証明書をレジストリの一記録に。",
  "getStarted.artistCta": "クリエイティブとして続ける",
  "getStarted.galleryTitle": "組織を代表しています",
  "getStarted.galleryDesc":
    "検証済み組織ワークフロー。代表クリエイティブの確認と掲載を記録に。",
  "getStarted.galleryCta": "プランを見て続ける",
  "getStarted.collectorTitle": "コレクターです",
  "getStarted.collectorDesc":
    "公開カタログを閲覧し、現在の記録を読み、保有時に保管を提出。",
  "getStarted.collectorCta": "コレクターとして続ける",
  "getStarted.catalogueTitle": "カタログについて",
  "auth.signIn": "サインイン",
  "auth.resetPassword": "パスワードをリセット",
  "auth.accessSubtitle": "メールとパスワードでレジストリにアクセス。",
  "auth.createAccount": "アカウントを作成",
  "auth.resetSubtitle":
    "アカウントのメールを入力してください。新しいパスワード用の安全なリンクを送信します。",
  "auth.email": "メール",
  "auth.password": "パスワード",
  "auth.forgotPassword": "パスワードをお忘れですか？",
  "auth.rememberMe": "ログイン状態を保持",
  "auth.signingIn": "サインイン中…",
  "auth.sendReset": "リセットリンクを送信",
  "auth.sending": "送信中…",
  "auth.backToSignIn": "サインインに戻る",
  "auth.needHelp": "お困りですか？",
  "auth.getStarted": "はじめる",
  "auth.artworkAuthHint": "サインインして作品記録を確認・認証してください。",
  "cookie.message":
    "基本機能と体験向上のために Cookie を使用しています。",
  "cookie.privacy": "プライバシー",
  "cookie.terms": "利用規約",
  "cookie.accept": "同意する",
  "cookie.decline": "拒否する",
  "contact.title": "お問い合わせ",
  "contact.lede": "一般的なお問い合わせ、パートナーシップ、機関向けのご用件。",
  "contact.note":
    "すべてのメッセージを確認します。返信までの時間は内容により異なります。データのエクスポート、アカウント削除、その他のプライバシー権利はマイアカウント → プライバシーとデータからご自身で行えます。",
  "registry.hero.headline": "検証済み記録を閲覧",
  "registry.hero.lede":
    "RROWM に登録された作品を探索します。記録を開いて権威ある検証レイヤーへ。作品ページはキュレーションされた表示です。",
  "registry.hero.trustNote":
    "この索引には検証済み作品のみ表示されます。証明書は公開グリッドでは表示されません。完全な証明書はサインイン後に閲覧できます。",
  "registry.hero.searching": "検索中",
  "registry.hero.clearSearch": "検索をクリア",
  "archive.nav.personalArchive": "個人アーカイブ",
  "archive.page.title": "個人アーカイブ",
  "archive.page.lede":
    "記録が更新され続けるなか、手元に置いておきたい作品です。",
  "archive.action.archive": "アーカイブ",
  "archive.action.archived": "アーカイブ済み",
  "archive.action.remove": "アーカイブから外す",
  "archive.count.one": "{count} 件の個人アーカイブに含まれる",
  "archive.count.many": "{count} 件の個人アーカイブに含まれる",
  "archive.footnote":
    "この作品は、登録参加者が維持する個人アーカイブに含まれています。",
  "archive.empty.title": "アーカイブされた作品はまだありません",
  "archive.empty.body":
    "個人アーカイブに置いた作品は、記録の更新に合わせていつでも参照できます。",
  "archive.empty.cta": "カタログを見る",
  "archive.loading": "アーカイブを読み込み中…",
  "archive.error.generic": "操作を完了できませんでした。",
  "archive.error.session": "ページを更新して再度お試しください。",
  "archive.card.statusVerified": "検証済み",
  "archive.card.statusRecorded": "記録済み",
  "archive.card.noImage": "画像なし",
  "archive.card.archivedOn": "アーカイブ日 {date}",
  "archive.card.currentRecord": "現在の記録",
  "archive.card.viewWork": "作品を見る",
  "registry.filters.search": "検索",
  "registry.filters.searchPlaceholder": "タイトルまたはレジストリ ID",
  "registry.filters.sort": "並べ替え",
  "registry.filters.sortNewest": "新しい順",
  "registry.filters.sortOldest": "古い順",
  "registry.filters.sortTitleAsc": "タイトル A–Z",
  "registry.filters.sortTitleDesc": "タイトル Z–A",
  "registry.filters.status": "ステータス",
  "registry.filters.allWorks": "すべての作品",
  "registry.filters.apply": "適用",
  "registry.empty.label": "レジストリ",
  "registry.empty.title": "表示する記録がありません",
  "registry.empty.noSearch":
    "検索に一致する検証済み作品がありません。別のキーワードを試すか、検索をクリアしてください。",
  "registry.empty.noRecords":
    "まだ検証済み作品がありません。記録が公開されたら再度ご確認ください。",
  "registry.list.title": "検証済み記録",
  "registry.list.page": "ページ {page}",
  "registry.card.registryId": "レジストリ ID",
  "registry.card.noImage": "画像なし",
  "registry.card.untitled": "無題",
  "registry.card.added": "追加日",
  "registry.card.certStatus": "証明書ステータス：",
  "registry.cert.verified": "検証済み",
  "registry.cert.revoked": "失効",
  "registry.card.viewRecord": "レジストリ記録を見る",
  "registry.card.verifyCert": "証明書を検証",
  "registry.card.viewCertLogin": "証明書を見る（要サインイン）",
  "registry.card.artworkPage": "作品ページ",
  "registry.pagination.showing": "{total} 件中 {start}–{end}",
  "registry.pagination.previous": "前へ",
  "registry.pagination.next": "次へ",
  "registry.pagination.pageOf": "{totalPages} ページ中 {page}",
  "about.hero.title": "作者性・来歴・検証を記録するシステム",
  "signup.joinTitle": "レジストリに参加",
  "signup.createArtistAccount": "クリエイティブアカウントを作成",
  "signup.subtitleArtworkAuth":
    "設定後、作品記録の確認と認証に戻ります。",
  "signup.signingUpAs": "次の役割で登録：",
  "signup.studioDesc":
    "スタジオでは代表作品、年表アクション、現在の記録をまとめて管理します。",
  "signup.alreadyRegistered": "すでに登録済みですか？",
  "signup.otherEntryPaths": "その他の入口",
  "signup.workEmail": "仕事用メール",
  "signup.confirmPassword": "パスワード確認",
  "signup.passwordPlaceholder": "8 文字以上",
  "signup.confirmPlaceholder": "パスワードを再入力",
  "signup.creatingProfile": "プロフィール作成中…",
  "signup.createProfile": "プロフィールを作成",
  "signup.checkEmail":
    "メールでアドレスを確認し、このブラウザに戻って設定を完了してください。",
  "signup.role.artist": "クリエイティブ",
  "signup.role.gallery": "組織",
  "signup.role.collector": "コレクター",
  "signup.err.inviteBlocked": "この招待では登録を完了できません。",
  "signup.err.emailRequired": "メールアドレスを入力してください。",
  "signup.err.passwordLength": "パスワードは 8 文字以上必要です。",
  "signup.err.passwordMismatch": "パスワードが一致しません。",
  "signup.invite.title": "招待",
  "signup.invite.verifying": "招待を確認中…",
  "signup.invite.oneMoment": "少々お待ちください。",
  "signup.invite.fetchError": "この招待を確認できませんでした",
  "signup.invite.expired": "この招待は期限切れです",
  "signup.invite.used": "この招待はすでに使用されています",
  "signup.invite.invalid": "この招待は無効です",
  "signup.invite.usedSubtitle":
    "アカウントをお持ちの場合は下からサインイン。そうでなければ新規アカウントを作成してください。",
  "signup.invite.fallbackSubtitle":
    "レジストリには引き続き参加できます。アカウントを作成するかサインインしてください。",
  "signup.invite.trustFooter":
    "この招待は RROWM レジストリ経由で送信されました。情報はプロフィールと代表作品の記録表示にのみ使用されます。",
  "signup.invite.createArtistProfile": "アーティストプロフィールを作成",
  "signup.invite.galleryInvited":
    "が記録上の認証を招待しています。プロフィール作成後、各記録を確認・深化します。",
  "signup.invite.directedTo":
    "この招待は {email} 宛です。登録時にそのアドレスを使用してください。",
  "signup.invite.recordsTitle": "あなたの活動に関連する記録",
  "signup.invite.noArtworks":
    "{gallery} が提出した記録は参加後にスタジオに表示されます。確認、作者性の認証、記録の深化ができます。",
  "signup.invite.joinMasked":
    "{email} としてレジストリに参加し、作者性を認証し、連続性を追加し、記録を深化してください。",
  "signup.invite.joinGeneric":
    "レジストリに参加し、作者性を認証し、連続性を追加し、記録を深化してください。",
  "signup.invite.attestationNote":
    "段階的な証明のみ。所有権の裁定や機関の承認ではありません。",
  "signup.invite.joinToAuthenticate": "参加して認証",
  "studio.nav.studio": "スタジオ",
  "studio.nav.records": "記録",
  "studio.nav.artworks": "作品",
  "studio.nav.certificates": "証明書",
  "studio.nav.ownership": "所有",
  "studio.shell.activity": "アクティビティ",
  "studio.shell.recentNotes": "最近のメモ",
  "studio.shell.catalogueActivity": "カタログアクティビティ",
  "studio.shell.browseCatalogue": "公開ギャラリーを見る",
  "studio.shell.noActivity": "最近のアクティビティはありません。",
  "registry.record.trust.revokedHeadline": "証明書失効",
  "registry.record.trust.revokedSub": "この記録はフラグ付きです。検証済みとして扱わないでください。",
  "registry.record.trust.verifiedHeadline": "検証済み記録",
  "registry.record.trust.verifiedSubCert":
    "証明書が記録にあります。権限のあるユーザーは全文書を閲覧できます。",
  "registry.record.trust.verifiedSubNoCert":
    "レジストリに記録済み。まだ証明書は発行されていません。",
  "registry.record.trust.unverifiedHeadline": "レジストリ記録",
  "registry.record.trust.unverifiedSub": "登録済みですが、まだ検証されていません。",
  "registry.record.verificationBy": "検証記録：{name}",
  "registry.record.badge.certificate": "証明書",
  "registry.record.badge.noCertificate": "証明書なし",
  "registry.record.badge.locked": "ロック",
  "registry.record.aboutWork": "この作品について",
  "registry.record.specifications": "仕様",
  "registry.record.provenance": "来歴",
  "registry.record.certStatusTitle": "証明書ステータス",
  "registry.record.verificationTitle": "検証",
  "gallery.nav.studio": "概要",
  "gallery.nav.recordDepth": "記録の深さ",
  "gallery.nav.roster": "アーティスト",
  "gallery.nav.catalogue": "作品",
  "gallery.nav.verification": "連続性と証明書",
  "gallery.nav.invitations": "招待",
  "gallery.shell.noCatalogueActivity": "最近のカタログアクティビティはありません。",
  "gallery.shell.loading": "読み込み中…",
  "gallery.shell.dismiss": "閉じる",
  "gallery.hero.tooltip":
    "機関のスタジオワークスペース。連続性、代表関係、カタログ記録を管理します。",
  "gallery.hero.institutionVerified": "記録済み · 機関検証済み",
  "gallery.hero.verificationPending": "検証保留中",
  "gallery.hero.subscriptionGrace": "猶予期間",
  "gallery.hero.subscriptionActive": "契約中",
  "gallery.hero.subscriptionInactive": "非アクティブ",
  "gallery.hero.subscriptionTrial": "トライアル",
  "gallery.hero.registryAuthority": "レジストリ権限",
  "gallery.hero.openCatalogue": "カタログを開く",
  "gallery.hero.work": "作品",
  "gallery.hero.works": "作品",
  "gallery.hero.inGalleryCatalogue": "ギャラリーカタログ内",
  "gallery.hero.singleRegistryIds": "代表アーティスト全体で単一のレジストリID。",
  "gallery.hero.institutionalVerification": "機関検証",
  "gallery.hero.trustAndCerts": "信頼と証明書",
  "gallery.hero.worksVerified": "検証済み作品",
  "gallery.hero.verifiedLine": "{count}件検証済み",
  "gallery.hero.awaitingLine": "{count}件保留中",
  "gallery.hero.recordDepth": "記録の深さ",
  "gallery.hero.mayDeepen": "深められる",
  "gallery.hero.institutionAttestation": "機関証明",
  "gallery.hero.artistAttestationOnFile": "アーティスト証明が記録済み",
  "gallery.hero.inviteOutstanding": "招待が未処理",
  "gallery.hero.invitesOutstanding": "招待が未処理",
  "gallery.hero.rosterAndInvites": "ロスターと招待",
  "gallery.hero.adminCanInvite": "管理者がワークスペースから招待可能",
  "gallery.hero.institutionAttestationLine":
    "機関証明 {count}件 · 深められる {pending}件",
  "gallery.hero.artistAttestationLine":
    "アーティスト証明記録済み {count}件 · 未処理の招待 {invites}件",
  "gallery.hero.openAmendments":
    "未対応の修正 {count}件：記録上で対応",
  "gallery.hero.amendmentsPending": "レビュー待ちの修正 {count}件",
  "gallery.hero.newInvitation": "新しい招待",
  "gallery.hero.registerWork": "作品を登録",
  "gallery.hero.inviteToAuthenticate": "認証に招待",
  "gallery.hero.aboutWorkspace": "このワークスペースについて",
  "gallery.hero.publicPage": "公開ページ",
  "gallery.hero.account": "アカウント",
  "gallery.hero.previewEmpty":
    "正規記録を登録すると、ここに注目作品が表示されます。",
  "gallery.intelligence.title": "カタログインテリジェンス",
  "gallery.intelligence.syncing": "指標を同期中…",
  "gallery.intelligence.registrationPace": "登録ペース",
  "gallery.intelligence.worksRegistered": "作品登録済み",
  "gallery.intelligence.addWorksTrend":
    "作品を追加して累積トレンドを確認してください。",
  "gallery.intelligence.tapCatalogueDetail":
    "タップしてカタログ詳細と構成を表示。",
  "gallery.intelligence.declaredValue": "申告価値",
  "gallery.intelligence.noDeclaredValues":
    "申告価値はまだありません。登録時に価値を記録してください。",
  "gallery.intelligence.multiCurrencyTap":
    "複数通貨の推移 · タップして探索。",
  "gallery.intelligence.recordHealth": "記録の健全性",
  "gallery.intelligence.gaps": "ギャップ",
  "gallery.intelligence.noData": "データはまだありません。",
  "gallery.intelligence.loadingBreakdown": "内訳を読み込み中…",
  "gallery.intelligence.certificatesAndGaps":
    "証明書と検証ギャップ · タップしてチャート表示。",
  "gallery.intelligence.ofCatalogueVerified":
    "のカタログがレジストリで検証済み",
  "gallery.intelligence.recordsNotVerified":
    "{count}件の記録が未検証",
  "gallery.intelligence.galleryVerificationPending":
    "ギャラリー検証保留中。承認後に証明が可能になります。",
  "gallery.intelligence.queueClear": "キューは空です。",
  "gallery.intelligence.openVerification":
    "検証を開いて保留中の作品を証明してください。",
  "gallery.summary.representedWorks":
    "代表 {artists} · 作品 {works}",
  "gallery.summary.verifiedSuffix": " · 検証済み {count}",
  "gallery.summary.noRecentActivity": "最近のアクティビティはありません。",
  "gallery.empty.createProfile": "ギャラリープロフィールを作成",
  "gallery.empty.createProfileBody":
    "レジストリ内での存在と権限を確立します。ダッシュボードを読み込むにはリンクされたギャラリー記録が必要です。",
  "gallery.empty.continueOnboarding": "ギャラリーオンボーディングへ →",
  "gallery.fallback.gallery": "ギャラリー",
  "gallery.fallback.artist": "アーティスト",
  "gallery.fallback.untitled": "無題",
  "gallery.recordDepth.empty":
    "深める待ちの証明はありません。正規記録が記録されると、アーティスト認証と修正がここに表示されます。",
  "gallery.roster.tooltip": "レジストリ上のギャラリーにリンク",
  "gallery.roster.noArtists": "アーティストはまだいません",
  "gallery.roster.noArtistsBody":
    "アーティストを接続すると、代表ステータスと作品数とともにここに表示されます。",
  "gallery.roster.goToInvitations": "招待へ",
  "gallery.roster.askAdmin": "管理者にアーティスト招待を依頼してください。",
  "gallery.roster.viewPublicProfile": "公開プロフィールを見る",
  "gallery.roster.noPublicProfile": "公開プロフィールなし",
  "gallery.roster.artist": "アーティスト",
  "gallery.roster.artists": "アーティスト",
  "gallery.representation.represented": "代表",
  "gallery.representation.historical": "過去",
  "gallery.representation.pending": "保留中",
  "gallery.catalogue.tooltip":
    "機関が提出したカタログ記録。作品を登録して年表を開き、機関証明を重ねます。",
  "gallery.catalogue.registerWork": "作品を登録",
  "gallery.catalogue.registeredWorks": "登録済み作品",
  "gallery.catalogue.inCatalogue": "カタログ内 {count}件",
  "gallery.catalogue.empty":
    "機関カタログに作品はまだありません。いつでも正規記録を登録できます。アーティストアカウントは任意です。",
  "gallery.catalogue.artistOnFile": "記録上のアーティスト",
  "gallery.catalogue.artistAttestationOnFile": "アーティスト証明が記録済み",
  "gallery.catalogue.artistAttestationMayDeepen": "アーティスト証明は深められる",
  "gallery.catalogue.artistAttestationNotYetOnFile":
    "アーティスト証明はまだ記録されていません",
  "gallery.catalogue.verified": "検証済み",
  "gallery.catalogue.onFile": "記録済み",
  "gallery.catalogue.invitationOnFile": "招待が記録済み",
  "gallery.catalogue.inviteArtistAuthenticate": "アーティストを認証に招待",
  "gallery.verification.tooltip":
    "記録の準備ができたときのみ確認してください。確認ステップが続きます。",
  "gallery.verification.notVerifiedInstitution":
    "機関はまだ検証されていません。検証操作は利用できません。",
  "gallery.verification.nothingAwaiting": "検証待ちはありません。",
  "gallery.verification.markVerified": "検証済みにする",
  "gallery.guide.title": "このワークスペースについて",
  "gallery.guide.body":
    "このワークスペースは、レジストリカタログ、参加、連続性と証明書、任意のアーティスト認証用招待をまとめます。プレーンテキストのアーティスト名でいつでも正規記録を登録できます。参加は層として深まります：まず機関提出、準備ができたらアーティスト証明。",
  "gallery.readiness.tooltip":
    "カタログ記録の運用チェックであり、分析ではありません。",
  "gallery.readiness.title": "記録の準備状態",
  "gallery.readiness.ready": "準備完了",
  "gallery.readiness.needsAttention": "要確認",
  "gallery.readiness.incomplete": "未完了",
  "gallery.readiness.allPass":
    "すべてのカタログ記録が準備チェックを通過しています。",
  "gallery.integrity.tooltip":
    "既存記録から導出される来歴の完全性と完全性シグナル。",
  "gallery.integrity.title": "記録の完全性",
  "gallery.integrity.complete": "完全",
  "gallery.integrity.needsAttention": "要確認",
  "gallery.integrity.incomplete": "未完了",
  "gallery.integrity.allPass":
    "すべてのカタログ記録が完全性チェックを満たしています。",
  "gallery.priority.tooltip":
    "完全性、検証、価値シグナル、市場コンテキスト、新しさに基づく運用上の優先順位。",
  "gallery.priority.title": "優先キュー",
  "gallery.priority.immediate": "即時",
  "gallery.priority.high": "高",
  "gallery.priority.standard": "標準",
  "gallery.priority.low": "低",
  "gallery.participation.descIntro":
    "以下の各作品は、機関の連続性レイヤー付きの正規記録です。",
  "gallery.participation.descMiddle":
    "アーティストが作者性を認証すると、アーティスト証明が深まる場合があります。",
  "gallery.participation.descOutro":
    "記録は完成しています。レイヤーが蓄積されます。",
  "gallery.participation.title": "証明は深められる",
  "gallery.participation.record": "記録",
  "gallery.participation.records": "記録",
  "gallery.participation.inviteAuthenticate": "認証に招待",
  "gallery.participation.untitledWork": "無題の作品",
  "gallery.participation.noImage": "画像なし",
  "gallery.participation.associatedArtist": "関連アーティスト",
  "gallery.participation.institutionLayer": " · 機関レイヤー {when}",
  "gallery.participation.publicRecord": "公開記録",
  "gallery.status.ready": "準備完了",
  "gallery.status.needsAttention": "要確認",
  "gallery.status.incomplete": "未完了",
  "gallery.status.complete": "完全",
  "gallery.invitations.hubDesc":
    "2つの連続性チャネル：一般的な代表関係と作品固有の認証。正規記録は独立して存在し、招待は参加者証明を深めます。",
  "gallery.invitations.tabRepresentation": "代表関係",
  "gallery.invitations.tabArtworkAuth": "作品認証",
  "gallery.invitations.tabListLabel": "招待タイプ",
  "gallery.invitations.sectionTooltip":
    "アーティストに、自身の活動に関連する記録の認証を依頼します。正規作品記録は独立して存在し、招待はギャラリー承認ワークフローではなく参加者証明を深めます。",
  "gallery.invitations.sendRepresentationLabel": "代表招待を送信",
  "gallery.invitations.artistEmail": "アーティストのメール",
  "gallery.invitations.emailPlaceholder": "artist@example.com",
  "gallery.invitations.sentAs": "送信元：",
  "gallery.invitations.representationBody":
    "アーティストは、機関を参照して記録上の内容を確認・承認する正式な招待を受け取ります。",
  "gallery.invitations.duplicatePending":
    "このアドレスにはすでに保留中の招待があります。",
  "gallery.invitations.resend": "招待を再送",
  "gallery.invitations.adminOnly": "招待を送信できるのは管理者のみです。",
  "gallery.invitations.noneSent": "まだ招待は送信されていません。",
  "gallery.invitations.colArtist": "アーティスト",
  "gallery.invitations.colStatus": "ステータス",
  "gallery.invitations.colSentDate": "送信日",
  "gallery.invitations.colActions": "操作",
  "gallery.invitations.statusDeclined": "辞退",
  "gallery.invitations.copyInviteLink": "招待リンクをコピー",
  "gallery.invitations.copied": "コピー済み",
  "gallery.invitations.publishing": "公開中…",
  "gallery.invitations.publish": "公開",
  "gallery.invitations.manualDraftHint":
    "招待メールを送信できなかった場合、下書きをコピーできます。",
  "gallery.invitations.copyDraft": "下書きをコピー",
  "gallery.invitations.representationSectionTitle": "代表招待",
  "gallery.invitations.representationSectionDesc":
    "作品固有の認証とは別に、機関に一般的に参加するようアーティストを招待します。",
  "gallery.artworkAuth.sectionTitle": "作品認証の招待",
  "gallery.artworkAuth.sectionDescIntro":
    "特定の正規記録の連続性履歴。",
  "gallery.artworkAuth.emptyBody":
    "作品認証の招待はまだありません。作品から、登録済み記録で{cta}を使用してください。",
  "gallery.artworkAuth.sentPrefix": "送信",
  "gallery.artworkAuth.resend": "再送",
  "gallery.artworkAuth.copyLink": "リンクをコピー",
  "gallery.artworkAuth.statusAuthenticated": "作者性認証済み",
  "gallery.artworkAuth.statusWithdrawn": "取り下げ",
  "gallery.artworkAuth.statusExpired": "期限切れ",
  "gallery.artworkAuth.statusAwaiting": "認証待ち",
  "gallery.artworkAuth.modalTitle": "アーティストを認証に招待",
  "gallery.artworkAuth.modalLead":
    "この作品記録はすでにレジストリに記録されています。アーティストに作者性の認証、年表の深化、作者情報の追加を依頼してください。",
  "gallery.artworkAuth.modalOutcome":
    "アーティストは、この作品に紐づいた連続性招待を受け取ります。",
  "gallery.artworkAuth.ctaSend": "連続性招待を送信",
  "gallery.artworkAuth.artistOnFile": "記録上のアーティスト：",
  "gallery.artworkAuth.institutionContinuityPending": "機関連続性は保留中",
  "gallery.artworkAuth.personalNote": "個人的なメモ（任意）",
  "gallery.artworkAuth.notePlaceholder":
    "短い連続性メモ。アーカイブ調の文体で、承認依頼ではありません。",
  "gallery.artworkAuth.adminOnlyError":
    "作品認証招待を送信できるのはギャラリー管理者のみです。",
  "gallery.artworkAuth.invalidEmail": "有効なアーティストのメールを入力してください。",
  "gallery.artworkAuth.sendFailed": "招待を送信できませんでした。",
  "gallery.artworkAuth.networkError": "ネットワークエラー。再試行してください。",
  "gallery.artworkAuth.inviteOnFile": "{email} 向けの招待が記録済み。",
  "gallery.artworkAuth.inviteSent": "{email} に連続性招待を送信しました。",
  "gallery.artworkAuth.close": "閉じる",
  "gallery.toast.loadMembershipFailed": "ギャラリーメンバーシップを読み込めませんでした。",
  "gallery.toast.requestIncomplete": "リクエストが完了しませんでした（{status}）。",
  "gallery.toast.inviteRecordAdminOnly":
    "招待を記録できるのはギャラリー管理者のみです。",
  "gallery.toast.inviteDuplicateOnFile":
    "このアドレスにはすでに招待が記録されています。",
  "gallery.toast.inviteOnFileWithDetail": "{email} 向けに記録済み。{detail}",
  "gallery.toast.inviteSentTo": "招待を記録済み。{email} にコピーを送信しました。",
  "gallery.toast.inviteRecordedNoEmail":
    "{email} 向けに記録済み。メール未送信。手動下書きをコピーするかメール設定を調整してください。",
  "gallery.toast.inviteResentSignupLink":
    "招待を再送して記録済み。アーティストに新しい登録リンクを送信しました。",
  "gallery.toast.inviteLinkRefreshedNoEmail":
    "招待リンクを記録上で更新しました。メール未送信。行からリンクをコピーしてください。",
  "gallery.toast.inviteVisibilityPublic":
    "公開設定を更新しました。アーティストが機関ページで公開表示されます。",
  "gallery.toast.couldNotPublish": "公開できませんでした（{status}）。",
  "gallery.toast.couldNotResend": "再送できませんでした（{status}）。",
  "gallery.toast.artworkAuthResent": "作品認証の招待を再送しました。",
  "gallery.toast.artworkAuthRefreshedNoEmail":
    "招待を記録上で更新しました。メールは送信されませんでした。",
  "gallery.toast.copyFailed": "コピーできませんでした。手動でテキストを選択してください。",
  "gallery.toast.imageRequired":
    "正規記録を開くには画像が必要です。",
  "gallery.toast.artistNameRequired":
    "ロスターのアーティストがリンクされていない場合、アーティスト名が必要です。",
  "gallery.toast.registerFailedDetail":
    "作品を記録できませんでした。権限、必須項目、カタログ移行を確認してください。",
  "gallery.toast.profileAdminOnly":
    "機関プロフィールを編集できるのはギャラリー管理者のみです。",
  "gallery.toast.profileSaveFailed": "変更を記録できませんでした。",
  "gallery.toast.verifyFailed": "検証が完了しませんでした。",
  "gallery.toast.verifySuccess":
    "証明を記録しました。この作品はレジストリで検証済みです。",
  "gallery.toast.certificateFailed": "証明書を記録できませんでした。",
  "gallery.toast.certificateFiled": "この作品の証明書を記録しました。",
  "gallery.toast.certificateAlreadyOnFile":
    "この作品の証明書はすでに記録済みです。",
  "gallery.toast.certificateRetryFailed":
    "証明書を記録できませんでした。再試行してください。",
  "gallery.toast.representationEndedFull":
    "代表関係を記録上で終了しました。以前の提出は年表上に残ります。",
  "gallery.toast.latestActivity": "最新のアクティビティ：{title}",
  "gallery.toast.latestActivityWhen": "最新のアクティビティ：{title} · {when}",
  "gallery.toast.registerRequestFailed": "リクエストに失敗しました。",
  "gallery.artworkAuth.review.loading": "記録レビューを読み込み中…",
  "gallery.artworkAuth.review.loadFailed":
    "この記録レビューを読み込めませんでした。リンクを再試行してください。",
  "gallery.artworkAuth.review.missingLink":
    "レビューリンクがありません。招待メールまたはアーティストスタジオから開いてください。",
  "gallery.artworkAuth.review.loadFailedHint":
    "招待リンクの期限切れ、または記録の移動の可能性があります。再試行するか機関に連絡してください。",
  "gallery.artworkAuth.review.joinRegistry": "レジストリに参加",
  "gallery.artworkAuth.review.signIn": "サインイン",
  "gallery.artworkAuth.review.joinPrompt":
    "レジストリに参加して記録を管理するアーティストの方は、アカウント作成またはサインインができます。",
  "gallery.artworkAuth.review.authFailed":
    "記録上の作者性を認証できませんでした。",
  "gallery.artworkAuth.review.wrongEmail":
    "この招待は別のメールアドレス宛てです。招待を受けたアドレスでサインインするか、機関に再送を依頼してください。",
  "gallery.artworkAuth.review.notAuthorized":
    "アカウントが記録上のアーティスト名と一致しません。招待メールのアドレスでサインインするか、機関に連絡してください。",
  "gallery.artworkAuth.review.contributeFailed": "提出を記録できませんでした。",
  "gallery.artworkAuth.review.withdrawn":
    "この連続性招待は取り下げられました。機関が必要に応じて新しい招待を送る場合があります。",
  "gallery.artworkAuth.review.expired":
    "この招待リンクは期限切れです。機関が新しい招待を送る場合があります。",
  "gallery.artworkAuth.review.unavailable":
    "この記録レビューは利用できません。すでに認証済みか、リンクが変更された可能性があります。",
  "gallery.artworkAuth.review.authenticatedTitle":
    "作者性が記録上で認証されました",
  "gallery.artworkAuth.review.authenticatedBody":
    "アーカイブ調の作者情報で年表を深めることができます。",
  "gallery.artworkAuth.review.viewPublicRecord": "公開記録を見る",
  "gallery.artworkAuth.review.contributeAuthorship": "作者情報を提出",
  "gallery.artworkAuth.review.artistStudio": "アーティストスタジオ",
  "gallery.artworkAuth.review.openPublicRecord": "公開記録を開く",
  "gallery.artworkAuth.review.openPublicRecordHint":
    "新しいタブで年表の全体像を確認できます。",
  "gallery.artworkAuth.review.signInPrompt":
    "レジストリに参加するか {email} としてサインインし、作者性を認証して記録を深めてください。",
  "gallery.artworkAuth.review.signInPromptGeneric":
    "レジストリに参加またはサインインして、作者性を認証し記録を深めてください。",
  "gallery.artworkAuth.review.joinToReview": "参加してレビュー",
  "gallery.artworkAuth.review.authenticateCta": "記録上の作者性を認証",
  "gallery.artworkAuth.review.viewRecordFirst": "先に公開記録を見る",
  "gallery.artworkAuth.review.cardTooltip":
    "あなたの活動に関連する作品がレジストリに記録されています。記録を確認し、作者性を認証してください。",
  "gallery.artworkAuth.review.workOnFile": "記録上の作品",
  "gallery.artworkAuth.review.institutionLabel": "記録上の機関",
  "gallery.artworkAuth.review.artistLabel": "記録上のアーティスト",
  "gallery.artworkAuth.review.personalMessage": "機関からの個人的なメッセージ",
  "gallery.artworkAuth.review.joinPlatformPrompt":
    "レジストリに参加して作者性を認証し、記録上の文書を深めてください。",
  "gallery.ops.reason.registryIdMissing": "レジストリIDがありません",
  "gallery.ops.reason.noArtistLinked": "アーティストがリンクされていません",
  "gallery.ops.reason.noOwnership": "所有記録がありません",
  "gallery.ops.reason.noOwnershipHistory": "所有履歴がありません",
  "gallery.ops.reason.ownershipLedgerMismatch":
    "所有台帳が現在の所有者と一致しません",
  "gallery.ops.reason.titleMissing": "タイトルがありません",
  "gallery.ops.reason.metadataFingerprintMissing": "メタデータフィンガープリントがありません",
  "gallery.ops.reason.missingDeclaredValue": "申告価値がありません",
  "gallery.ops.reason.missingImage": "画像がありません",
  "gallery.ops.reason.incompleteMetadata": "メタデータ不完全（年 / 媒体）",
  "gallery.ops.reason.certificateRevoked": "証明書が取り消されました",
  "gallery.ops.reason.missingVerification": "検証がありません",
  "gallery.ops.reason.noCertificateOnFile": "証明書が記録されていません",
  "gallery.ops.reason.listedWithoutVerification":
    "検証なしでマーケットに掲載",
  "gallery.ops.reason.listedWithoutCertificate":
    "証明書なしでマーケットに掲載",
  "gallery.ops.reason.noDeclaredValueOnFile": "申告価値が記録されていません",
  "gallery.ops.reason.highDeclaredValue": "高い申告価値",
  "gallery.ops.reason.materialDeclaredValue": "相当な申告価値",
  "gallery.ops.reason.verifiedWithoutCertificate": "証明書なしで検証済み",
  "gallery.ops.reason.noVerificationSignals": "検証シグナルがありません",
  "gallery.ops.reason.certifiedRecord": "認証済み記録",
  "gallery.ops.reason.recentActivity": "最近の活動",
  "gallery.ops.reason.oldIncomplete": "古い記録が未完了のまま",
  "gallery.ops.reason.highValueNoCertificate": "高価値だが証明書なし",
  "gallery.ops.action.assignArtist": "アーティストを割り当て",
  "gallery.ops.action.viewRecord": "記録を表示",
  "gallery.ops.action.completeDetails": "詳細を完成",
  "gallery.ops.action.addValue": "価値を追加",
  "gallery.ops.action.verifyRecord": "記録を検証",
  "gallery.ops.action.issueCertificate": "証明書を発行",
  "gallery.ops.recommended.noAction": "対応不要",
  "gallery.ops.recommended.reviewRecord": "記録を確認",
  "gallery.api.invalidJson": "無効なJSON",
  "gallery.api.invalidBody": "無効なリクエスト本文",
  "gallery.api.unauthorized": "認可されていません",
  "gallery.api.missingGalleryId": "gallery_id がありません",
  "gallery.api.invalidArtistEmail": "artist_email が無効です",
  "gallery.api.inviteAdminOnly":
    "ギャラリー管理者のみ招待を送信できます。",
  "gallery.api.resendAdminOnly":
    "ギャラリー管理者のみ招待を再送できます。",
  "gallery.api.couldNotLoadGallery": "ギャラリーを読み込めませんでした。",
  "gallery.api.galleryNotFound": "ギャラリーが見つかりません。",
  "gallery.api.couldNotVerifyInviteState":
    "招待状態を確認できませんでした。",
  "gallery.api.alreadyInvited": "このアーティストは既に招待されています。",
  "gallery.api.couldNotRecordInvite": "招待を記録できませんでした。",
  "gallery.api.missingInviteId": "invite_id または inviteId がありません。",
  "gallery.api.inviteNotFound": "招待が見つかりません。",
  "gallery.api.inviteNotPending":
    "保留中の招待のみ再発行できます。",
  "gallery.api.missingArtworkId": "artwork_id がありません",
  "gallery.api.artworkNotFound": "作品が見つかりません",
  "gallery.api.noInstitutionContext":
    "この作品には機関提出コンテキストがありません。",
  "gallery.api.emailCreatedFailed":
    "招待は記録済み。メール未送信。必要なら行からリンクをコピーしてください。",
  "gallery.api.emailUpdatedFailed":
    "招待リンクを更新済み。メール未送信。必要なら行からリンクをコピーしてください。",
  "gallery.api.notAuthorisedInstitution": "この機関に対する権限がありません",
  "gallery.api.artworkAuthDuplicatePending":
    "この作品のこのアドレスには既に保留中の認証招待があります。",
  "gallery.api.artworkAuthAlreadyCompleted":
    "この招待は既に記録上完了しています。",
  "gallery.inviteDraft.subject":
    "{galleryName} が RROWM レジストリへの参加を招待しました",
  "gallery.inviteDraft.to": "宛先: {email}",
  "gallery.inviteDraft.bodyIntro":
    "{galleryName} が代表アーティストとして RROWM レジストリへの参加を招待しました。",
  "gallery.inviteDraft.acceptLine1":
    "承諾するには、レジストリメールの個別リンク（一回限りトークン）を使用してください。",
  "gallery.inviteDraft.acceptLine2":
    "招待されたこのアドレスのみで登録してください。",
  "gallery.inviteDraft.registrySignup":
    "レジストリ登録: {site}/signup?invite_token=<レジストリメールから貼り付け>",
  "gallery.inviteDraft.galleryPage": "ギャラリーページ: {url}",
  "gallery.inviteDraft.galleryPagePlaceholder":
    "ギャラリーページ: {site}/gallery/<gallery-slug>",
  "gallery.inviteDraft.afterOnboarding":
    "アーティストオンボーディング完了後、招待が確認され、ギャラリーに通知される場合があります。",
  "gallery.email.artistInvite.subject": "{galleryName} · 記録上の作品を認証",
  "gallery.email.artistInvite.preheader":
    "ご自身の活動に関連する記録を認証し深める",
  "gallery.email.artistInvite.kicker": "正規記録 · 参加者証明",
  "gallery.email.artistInvite.body1":
    "{galleryName} はご自身の活動に関連する作品の記録上の年表に参加しています。{inviteRecordExists} 作者性を認証し文書記録を深めるよう招待されています。機関アップロードの承認ではありません。",
  "gallery.email.artistInvite.body2":
    "参加後: 正規記録を確認し、作者性を認証し、アーティスト情報を追加し、継続イベントに貢献してください。{recordDeepensOverTime}。",
  "gallery.email.artistInvite.body3":
    "リンクはこのアドレス専用・一回限りで、招待記録に従い期限切れになります。",
  "gallery.email.artistInvite.cta": "認証して参加",
  "gallery.email.artistInvite.footnote":
    "意図した宛先でない場合は何もしないでください。リンクを転送しないでください。",
  "gallery.email.artistInvite.textIntro":
    "{galleryName} はご自身の活動に関連する作品の年表に参加しています。",
  "gallery.email.artistInvite.textLink": "認証して参加（一回限りリンク）:",
  "gallery.email.artistInvite.textRegister":
    "このメールのみで登録: {email}",
  "gallery.email.artistInvite.textDisregard":
    "誤送信の場合は無視してください。",
  "gallery.email.artworkAuth.subject":
    "記録上の作品を認証 · {title}",
  "gallery.email.artworkAuth.preheader":
    "正規作品記録を確認・認証・深化する。",
  "gallery.email.artworkAuth.kicker": "作品記録 · 継続招待",
  "gallery.email.artworkAuth.body1":
    "ご自身の活動に関連する作品が既にレジストリに記録されています。",
  "gallery.email.artworkAuth.body2":
    "{title}{registryLine}{galleryName} による継続参加で提出済み。",
  "gallery.email.artworkAuth.body3":
    "確認・作者性認証・文書記録の深化をお願いしています。{recordDeepensOverTime}。機関の承認依頼やオンボーディングタスクではありません。",
  "gallery.email.artworkAuth.noteFrom": "{galleryName} からのメモ:",
  "gallery.email.artworkAuth.body4":
    "リンクはこのアドレス専用で、招待記録に従い期限切れになります。",
  "gallery.email.artworkAuth.cta": "作品記録を確認",
  "gallery.email.artworkAuth.footnote":
    "意図した宛先でない場合は何もしないでください。リンクを転送しないでください。",
  "gallery.email.fallback.institution": "機関",
  "gallery.email.fallback.artwork": "記録上の作品",
  "gallery.email.fallback.gallery": "ギャラリー",
  "representation.publicParticipationOnFile": "公開参加が記録済み",
  "representation.artistAttestationOnFile": "アーティスト証明が記録済み",
  "representation.artistAttestationMayDeepen": "アーティスト証明は深められる",
  "pricing.eyebrow": "組織 Studio · 有料アクセス",
  "pricing.title": "組織 Studio での RROWM の使い方を選ぶ",
  "pricing.pro.continue": "登録に進む",
  "pricing.enterprise.contact": "レジストリに問い合わせ",
  "about.principles.title": "信頼のために設計されたレジストリ",
  "about.tabs.what": "概要",
  "about.tabs.how": "仕組み",
  "about.tabs.visibility": "公開範囲",
  "about.tabs.properties": "特性",
  "about.tabs.who": "対象",
  "about.what.title": "レジストリとは",
  "about.how.title": "仕組み",
  "about.visibility.title": "公開記録、非公開の詳細",
  "about.properties.title": "システムの特性",
  "about.audience.title": "対象者",
  "collector.nav.workspace": "スタジオ",
  "collector.nav.works": "作品",
  "collector.nav.attention": "要確認",
  "collector.shell.publicCollection": "公開コレクション",
  "collector.shell.publicListingsNote":
    "公開リストには所有が検証済みの作品のみ表示されます。",
  "collector.shell.loading": "読み込み中…",
  "collector.hero.fallbackCollection": "あなたのコレクション",
  "collector.hero.tooltip":
    "保有作品のための静かな空間。所有状態、要確認項目、履歴 — カタログのマーケティング装飾なし。",
  "collector.hero.ownershipOnRecord": "記録上の所有",
  "collector.hero.viewWorks": "作品を見る",
  "collector.hero.inStewardship": "あなたのスタジオ内",
  "collector.hero.studioSince": "{year}年からスタジオ",
  "collector.hero.work": "作品",
  "collector.hero.works": "作品",
  "collector.hero.verifiedOwnership": "検証済み所有",
  "collector.hero.privateByDefault": "既定で非公開",
  "collector.hero.accountPresence": "アカウントと公開設定",
  "collector.hero.profile": "プロフィール",
  "collector.hero.on": "オン",
  "collector.hero.off": "オフ",
  "collector.hero.publicPageAvailable": "公開コレクションページが利用可能です。",
  "collector.hero.workspacePrivate": "公開プロフィールなし。スタジオは非公開のまま。",
  "collector.hero.anonymousLabel": "匿名ラベル",
  "collector.hero.nameShown": "名前を表示",
  "collector.hero.continuity": "連続性",
  "collector.hero.openAttention": "要確認を開く（{count}）",
  "collector.hero.nothingNeedsAttention": "要確認はありません",
  "collector.hero.item": "件",
  "collector.hero.items": "件",
  "collector.hero.attentionLabel": "移転、申請、検証",
  "collector.hero.actionSuggested": "対応を推奨",
  "collector.hero.allClear": "問題なし",
  "collector.hero.publicCollection": "公開コレクション",
  "collector.hero.publicPageWhenSlug": "スラッグが利用可能になると公開ページ",
  "collector.hero.registry": "レジストリ",
  "collector.hero.previewEmpty":
    "保有作品は、記録に画像が含まれるとここに表示されます。",
  "collector.hero.previewNoImages":
    "作品に画像が含まれると表示されます。",
  "collector.overview.srOnly": "コレクション概要",
  "collector.overview.empty":
    "まだ保有作品がありません。所有を申請または受け取ると、ここに表示されます。",
  "collector.overview.held": "{count} {units}を保有。",
  "collector.overview.verifiedOwnership":
    "検証済み所有 {units} {count}件。",
  "collector.overview.pendingTransfer": "保留中の{units} {count}件。",
  "collector.overview.notVerified":
    "未検証の所有{units} {count}件。",
  "collector.overview.openClaims": "進行中の所有{units} {count}件。",
  "collector.overview.withCertificate":
    "記録上に証明書のある{units} {count}件。",
  "collector.word.work": "作品",
  "collector.word.works": "作品",
  "collector.word.record": "記録",
  "collector.word.records": "記録",
  "collector.word.transfer": "移転",
  "collector.word.transfers": "移転",
  "collector.word.claim": "申請",
  "collector.word.claims": "申請",
  "collector.works.title": "作品",
  "collector.works.order": "並び順：",
  "collector.works.sortRecency": "新しい順",
  "collector.works.sortValue": "申告価値",
  "collector.works.emptyPrefix": "所有を申請するには",
  "collector.works.emptyLink": "レジストリ",
  "collector.works.emptySuffix": "から始めてください。",
  "collector.works.transferPending": "移転保留中",
  "collector.works.verificationOutstanding": "検証未完了",
  "collector.attention.title": "要確認",
  "collector.attention.empty": "現在、対応が必要な項目はありません。",
  "collector.attention.verificationPending":
    "所有検証保留中：{title}",
  "collector.attention.transferResolve": "解決が必要な移転：{title}",
  "collector.attention.claimInProgress": "所有申請進行中：{title}",
  "collector.fallback.collector": "コレクター",
  "collector.fallback.artist": "アーティスト",
  "collector.fallback.untitled": "無題",
  "collector.fallback.work": "作品",
  "collector.activity.emptyHold":
    "作品を保有すると、ここに活動が表示されます。",
  "collector.activity.loading": "読み込み中…",
  "collector.activity.noEvents":
    "コレクションに最近のイベントはありません。",
  "collector.activity.saleTransferPending": "売却：移転保留中",
  "collector.activity.valueRecorded": "価値を記録",
  "collector.activity.ownershipClaim": "所有申請",
  "collector.activity.ownershipUpdate": "所有を更新",
  "collector.activity.verification": "検証",
  "collector.activity.untitledWork": "無題の作品",
  "collector.activity.detail": "{title} · {kind}",
  "collector.activity.detailWithStatus": "{title} · {kind} · {status}",
  "provenance.empty": "この作品の年表マイルストーンはまだ記録にありません。",
  "provenance.chronology": "年表",
  "provenance.fullChronology": "年表全体",
  "provenance.currentRecord": "現在の記録",
  "provenance.completeness.high": "多層の記録",
  "provenance.completeness.moderate": "成長中の記録",
  "provenance.completeness.limited": "開始記録",
  "provenance.insight.noVerification": "この作品には検証シグナルがありません。",
  "provenance.insight.ownershipUnverified": "現在の所有は未検証です。",
  "provenance.insight.saleIncomplete": "売却記録あり。所有移転は未完了です。",
  "provenance.insight.fullyVerified": "完全に検証された記録です。",
  "provenance.insight.noRecentActivity": "最近の活動は記録されていません。",
  "about.journey.recordTitle": "記録",
  "about.journey.recordSubtitle": "作品ごとに一意のレジストリ ID",
  "about.journey.verifyTitle": "検証",
  "about.journey.verifySubtitle": "暗号学的証明と不変のタイムスタンプ",
  "about.journey.certifyTitle": "証明",
  "about.journey.certifySubtitle": "記録に紐づく真正性文書",
  "about.journey.traceTitle": "追跡",
  "about.journey.traceSubtitle": "時間経過に伴う所有と価値の履歴",
  "about.journey.then": "次に",
  "provenance.event.registration": "作品がレジストリに登録",
  "provenance.event.institutional": "機関関連が記録されました",
  "provenance.event.custody": "年表に保管が反映",
  "provenance.chronologyIntro":
    "エントリは蓄積され、後の提出は以前のものと並びます。確認と保管ステップが記録されると複数の参加者が現れます。",
  "provenance.howFileReads": "記録の読み方",
  "provenance.continuityMarkers": "連続性マーカー",
  "provenance.supportingMaterial": "裏付け資料を添付",
  "provenance.certificateOnFile": "証明書を記録",
  "studio.search.byTitle": "タイトルで検索…",
  "studio.search.artworks": "作品を検索…",
  "studio.search.certificates": "証明書を検索…",
  "studio.filter.artworks": "作品を絞り込む",
  "studio.filter.certificates": "証明書を絞り込む",
  "studio.filter.ownership": "所有記録を絞り込む",
  "studio.filter.verifiedOnly": "検証済みのみ",
  "studio.filter.notVerified": "未検証",
  "studio.filter.withDeclaredValue": "申告価値あり",
  "studio.filter.noDeclaredValue": "申告価値なし",
  "studio.registerArtwork": "作品を登録",
  "studio.artworks.noMatches": "検索またはフィルターに一致する作品はありません。",
  "studio.artworks.verified": "検証済み",
  "studio.artworks.notVerified": "未検証",
  "studio.artworks.verifiedTooltip": "記録上で検証済み。",
  "studio.artworks.recordValue": "価値を記録",
  "studio.artworks.noRecordId": "レジストリIDなし",
  "studio.artworks.emptyLabel": "あなたのスタジオ",
  "studio.artworks.emptyTitle": "まだ代表作品の記録がありません",
  "studio.certificates.all": "すべての証明書",
  "studio.certificates.withImage": "作品画像あり",
  "studio.certificates.withoutImage": "画像なし",
  "studio.certificates.noMatches": "検索またはフィルターに一致する証明書はありません。",
  "studio.certificates.imagePlaceholder": "レジストリ記録",
  "studio.certificates.registryCertificate": "レジストリ証明書",
  "studio.certificates.open": "開く →",
  "studio.certificates.emptyLabel": "レジストリ証明書",
  "studio.certificates.emptyTitle": "まだ検証済みの証明書がありません",
  "studio.ownership.filterAll": "すべての記録 ({count})",
  "studio.ownership.filterNeedsTransfer": "移転が必要 ({count})",
  "studio.ownership.filterSold": "売却済み ({count})",
  "studio.ownership.filterHeldByYou": "あなたが保管 ({count})",
  "studio.ownership.noMatches": "検索またはフィルターに一致する所有記録はありません。",
  "studio.ownership.noTransfers": "まだ移転がありません",
  "studio.ownership.transferLedger": "台帳に{count}件の移転",
  "studio.ownership.transferLedgerPlural": "台帳に{count}件の移転",
  "studio.ownership.you": "あなた",
  "studio.ownership.unassigned": "未割当",
  "studio.ownership.collectorId": "コレクター ({id}…)",
  "studio.ownership.saleLogged": "売却を記録：移転を完了してください",
  "studio.ownership.lastEventSale": "最新イベント · 売却",
  "studio.ownership.inYourCustody": "あなたが保管中",
  "studio.ownership.currentHolder": "現在の保有者",
  "studio.ownership.chainDepth": "チェーンの深さ",
  "studio.ownership.transfersOnRecord": "記録上{count}件の移転",
  "studio.ownership.transfersOnRecordPlural": "記録上{count}件の移転",
  "studio.ownership.noRegistryId": "レジストリIDなし",
  "studio.ownership.ledgerLink": "台帳 →",
  "studio.ownership.emptyLabel": "所有",
  "studio.ownership.emptyTitle": "まだ所有に関する活動がありません",
  "common.cancel": "キャンセル",
  "common.save": "保存",
  "common.saving": "保存中…",
  "common.recording": "記録中…",
  "common.processing": "処理中…",
  "common.approve": "承認",
  "common.reject": "却下",
  "common.sending": "送信中…",
  "common.ending": "終了中…",
  "studio.hero.fallbackArtist": "アーティスト",
  "studio.hero.catalogue": "カタログ",
  "studio.hero.openArtworks": "作品を開く",
  "studio.hero.registeredInStudio": "スタジオに登録",
  "studio.hero.work": "作品",
  "studio.hero.works": "作品",
  "studio.hero.verifiedBadge": "検証済み {count}件",
  "studio.hero.pricedBadge": "価値記録 {count}件",
  "studio.hero.recordsToDeepen":
    "認証・詳細化が必要な記録 {count}件",
  "studio.hero.recordsToDeepenPlural":
    "認証・詳細化が必要な記録 {count}件",
  "studio.hero.amendmentNeedsResponse": "回答が必要な修正 {count}件",
  "studio.hero.amendmentsNeedResponse": "回答が必要な修正 {count}件",
  "studio.hero.recordHealth": "記録の状態",
  "studio.hero.certificates": "証明書",
  "studio.hero.verified": "検証済み",
  "studio.hero.priced": "価値記録",
  "studio.hero.publicStudio": "公開スタジオ",
  "studio.hero.artistPage": "アーティストページ",
  "studio.hero.notPublishedYet": "未公開",
  "studio.hero.viewPublicPage": "公開ページを見る",
  "studio.hero.setupPresence": "公開設定",
  "studio.hero.ownershipLedger": "所有台帳",
  "studio.hero.previewEmpty":
    "作品を登録すると、ここにカタログのプレビューが表示されます。",
  "studio.loading.opening": "スタジオを開いています…",
  "studio.form.title": "タイトル",
  "studio.form.titleRequired": "タイトル *",
  "studio.form.year": "年",
  "studio.form.medium": "素材・技法",
  "studio.form.dimensions": "サイズ",
  "studio.form.description": "説明",
  "studio.form.visibility": "公開範囲",
  "studio.form.image": "画像",
  "studio.form.imageRequired": "画像 *",
  "studio.form.initialAmount": "初期金額（任意）",
  "studio.form.currency": "通貨",
  "studio.form.eventType": "イベント種別",
  "studio.form.visibilityPrivate": "非公開",
  "studio.form.visibilityGallery": "ギャラリー",
  "studio.form.visibilityPublic": "公開",
  "studio.form.visibilityCertificate": "証明書",
  "studio.form.eventInitial": "初期",
  "studio.form.eventPrimarySale": "一次販売",
  "studio.form.eventSecondarySale": "二次販売",
  "studio.form.eventAppraisal": "鑑定",
  "studio.form.eventInternalEstimate": "内部見積",
  "studio.register.titleNew": "新しい作品を登録",
  "studio.register.titleGallery": "作品を登録",
  "studio.register.issueCanonical": "正規記録を発行",
  "studio.register.artistName": "アーティスト名",
  "studio.register.asCreditedPlaceholder": "作品のクレジット表記どおり",
  "studio.register.plainTextHint":
    "テキストのみで十分です。正規記録を開くのにアーティストアカウントは不要です。",
  "studio.register.artistEmailOptional": "アーティストのメール（任意）",
  "studio.register.emailInvitePlaceholder":
    "後日の認証・詳細化招待用",
  "studio.register.linkRosterOptional": "ロスターのアーティストにリンク（任意）",
  "studio.register.noAccountLink": "アカウントリンクなし、名前のみ記録",
  "studio.register.placeholderTitle": "作品タイトル",
  "studio.register.placeholderYear": "2024",
  "studio.register.placeholderMedium": "キャンバスに油彩",
  "studio.register.placeholderDimensions": "122 × 91 cm",
  "studio.register.placeholderDescription": "作品を説明…",
  "studio.register.placeholderAmount": "例: 50000",
  "studio.artworkDetail.valueHistory": "価値履歴",
  "studio.artworkDetail.noValueHistory": "まだ価値履歴がありません",
  "studio.valueEvent.title": "価値イベントを記録",
  "studio.valueEvent.declaredAmount": "申告金額",
  "studio.valueEvent.amountPlaceholder": "金額",
  "studio.valueEvent.noteOptional": "メモ（任意）",
  "studio.valueEvent.notePlaceholder": "任意の補足",
  "studio.valueEvent.helpAmount":
    "このイベントで記録する金額（評価、販売価格、見積など）。実際に述べられたまたは合意された金額に合わせてください。",
  "studio.valueEvent.helpCurrency":
    "上記金額のISO通貨。暗黙の換算ではなく、引用された通貨を選んでください。",
  "studio.valueEvent.helpEventTypes":
    "初期：最初のアンカー。一次販売：アーティストまたは一次市場からの最初の販売。二次販売：再販。鑑定：正式な評価。内部見積：スタジオ参照値。",
  "studio.valueEvent.helpVisibility":
    "非公開：スタジオ内のみ。ギャラリー：ギャラリー向けコンテキスト。証明書：証明書レイヤー。公開：ポリシーが許す場合の公開レジストリ面。",
  "studio.valueEvent.helpNotes":
    "任意の補足：フェア、チャネル、購入者タイプ、鑑定者など、後から解釈するのに役立つ情報。",
  "studio.overview.valueCoverage.title": "価値とカバレッジ",
  "studio.overview.valueCoverage.subtitle":
    "合計とレジストリ記録の完成度。",
  "studio.overview.totalValue": "合計価値",
  "studio.overview.totalValueCurrency": "合計価値 ({currency})",
  "studio.overview.noPricedWorks": "まだ価値記録のある作品がありません",
  "studio.overview.avgValueCurrency": "平均価値 ({currency})",
  "studio.overview.recordHealth": "記録の状態",
  "studio.overview.priced": "価値記録",
  "studio.overview.pricedHint": "申告価値のある作品",
  "studio.overview.verifiedHint": "レジストリで検証済み",
  "studio.overview.locked": "ロック済み",
  "studio.overview.lockedHint": "検証後は変更不可",
  "studio.overview.ownershipRequests.title": "所有権リクエスト",
  "studio.overview.ownershipRequests.subtitle":
    "コレクターからの認識要求。確認して回答してください。",
  "studio.overview.noPendingClaims":
    "保留中の申請はありません。コレクターが申請を提出すると、ここに表示されます。",
  "studio.overview.pendingReview": "審査待ち",
  "studio.overview.claimant": "申請者",
  "studio.overview.valueProgression.title": "価値の推移",
  "studio.overview.valueProgression.subtitle":
    "初期から最新まで、比較可能な価値の動き。",
  "studio.overview.avgChange": "平均価値変化",
  "studio.overview.avgChangeHint":
    "初期と最新が同じ通貨の場合の平均%変化。",
  "studio.overview.worksIncreased": "価値が上昇した作品",
  "studio.overview.decliningWorks": "価値が下落した作品",
  "studio.overview.noProgressionData": "まだ推移データがありません",
  "studio.overview.valueChange": "価値変化",
  "studio.overview.ownershipIntel.title": "所有インテリジェンス",
  "studio.overview.ownershipIntel.subtitle":
    "カタログ全体の移転、保有、動き。",
  "studio.overview.totalTransfers": "移転合計",
  "studio.overview.worksYouHold": "あなたが保有する作品",
  "studio.overview.avgHoldDays": "平均保有（日）",
  "studio.overview.catalogueHighlights.title": "カタログハイライト",
  "studio.overview.catalogueHighlights.subtitle":
    "レジストリ活動からの注目記録。",
  "studio.overview.mostTransferred": "最多移転",
  "studio.overview.mostTransferredHint": "移転回数が最多。",
  "studio.overview.longestHeld": "最長保有",
  "studio.overview.longestHeldHint":
    "最初と最新の移転間の最長期間。",
  "studio.overview.fastestAppreciating": "最大上昇率",
  "studio.overview.fastestAppreciatingHint":
    "初期から最新までの最大%上昇（同一通貨）。",
  "studio.records.noAwaitingAttestation":
    "あなたの証明を待つ記録はありません。正規記録があなたの活動に関連付けられると、ここに認証・詳細化のために表示されます。",
  "studio.records.institutionalRelationship": "機関関係",
  "studio.records.relationshipOnFile": "記録上の関係",
  "studio.records.endOnFile": "記録上で終了",
  "studio.records.linkedWith": "{name} とリンク済み。",
  "studio.records.linkVisibleAfterEnding":
    "終了後も、以前の提出物では機関リンクが表示されたままです。",
  "representation.canonicalRecordOnFile": "正規作品記録が記録済み",
  "representation.recordDeepensOverTime":
    "参加者の証明が積み重なるにつれ記録が深まります",
  "representation.institutionAttestationOnFile":
    "機関にリンクされた継続性が記録済み",
  "representation.priorContributionsRemainVisible":
    "以前の貢献は年表上で見えたままです",
  "representation.historicalInstitutionLayer":
    "過去の機関参加は記録に残ります",
  "representation.inviteRecordExists":
    "あなたの活動に関連する正規記録がすでに記録されています",
  "representation.notApprovalWorkflow":
    "重ね合わせの証明のみ。所有の裁定や機関の承認ではありません",
  "representation.representationOnFile": "機関関係が記録済み",
  "representation.priorFilingsRemainVisible":
    "以前の貢献は年表上で見えたままです",
  "representation.amendmentPendingReview": "修正が記録上で開いています",
  "studio.records.deepen.eyebrow": "正規記録",
  "studio.records.deepen.title": "認証と詳細化",
  "studio.records.deepen.description":
    "{inviteRecordExists}。{recordDeepensOverTime}。あなたが証明を提出します。作品は暫定的ではなく、機関のアップロードを承認するものではありません。",
  "studio.records.deepen.badge": "詳細化が必要な記録 {count}件",
  "studio.records.deepen.badgePlural": "詳細化が必要な記録 {count}件",
  "studio.records.deepen.step1": "記録上の正規記録を現状のまま確認する",
  "studio.records.deepen.step2": "作者性をあなたの証明として認証する",
  "studio.records.deepen.step3": "年表に記録保管の作者性貢献を提出する",
  "studio.records.deepen.step4": "任意で記録上の機関関係を認める",
  "studio.records.deepen.opened": "開いた日 {when}",
  "studio.records.deepen.reviewAuthenticate": "確認して認証",
  "studio.records.deepen.publicRecord": "公開記録",
  "studio.records.deepen.contributeAuthorship": "作者性を貢献",
  "studio.records.deepen.authenticateAuthorship": "作者性を認証",
  "studio.records.deepen.institution": "機関",
  "studio.amendments.eyebrow": "代表関係の修正",
  "studio.amendments.title": "年表の更新",
  "studio.amendments.description":
    "提案されたカタログの修正は、相手方が記録上で受け入れるまで暫定的です。以前の証明は見えたまま：累積する年表であり、置き換えではありません。",
  "studio.amendments.responseNeeded": "回答が必要 1件",
  "studio.amendments.responsesNeeded": "回答が必要 {count}件",
  "studio.amendments.newRequest": "新しい修正リクエスト",
  "studio.amendments.empty": "まだ修正リクエストの記録がありません。",
  "studio.amendments.workFallback": "作品",
  "studio.amendments.institution": "機関",
  "studio.amendments.representedArtist": "代表アーティスト",
  "studio.amendments.roleArtist": "アーティスト",
  "studio.amendments.roleInstitution": "機関",
  "studio.amendments.initiated": "開始",
  "studio.amendments.statusAccepted": "記録上で受理",
  "studio.amendments.statusDeclined": "却下",
  "studio.amendments.statusWithdrawn": "取り下げ",
  "studio.amendments.resolution": "決定：",
  "studio.amendments.viewPublicRecord": "公開記録を見る",
  "studio.amendments.responseNote": "回答メモ",
  "studio.amendments.responsePlaceholder": "回答メモ（任意）",
  "studio.amendments.acceptOnFile": "記録上で受理",
  "studio.amendments.decline": "却下",
  "studio.amendments.withdrawRequest": "リクエストを取り下げ",
  "studio.amendments.modalTitle": "新しい修正リクエスト",
  "studio.amendments.chooseWork": "作品を選んでください。",
  "studio.amendments.noteRequired": "提案する変更を説明するメモを追加してください。",
  "studio.amendments.noteDescribe":
    "変更内容を説明してください。任意のカタログ項目は相手方が受理した場合のみ適用されます。",
  "studio.amendments.requestFailed": "リクエストを送信できませんでした。",
  "studio.amendments.submitRequest": "リクエストを送信",
  "studio.authorship.title": "記録を深める",
  "studio.authorship.workFallback": "記録上の作品",
  "studio.authorship.statement": "作者性の声明",
  "studio.authorship.statementPlaceholder":
    "この作品の作者性の理解：実践、意図、または記録上の文脈…",
  "studio.authorship.chronology": "年表への貢献",
  "studio.authorship.chronologyPlaceholder":
    "日付、制作の文脈、展示履歴、記録に残したい継続性…",
  "studio.authorship.filing": "貢献を提出中…",
  "studio.authorship.fileContribution": "年表に貢献を提出",
  "studio.endRepresentation.title": "記録上で代表関係を終了",
  "studio.endRepresentation.noteOptional": "メモ（任意）",
  "studio.endRepresentation.notePlaceholder":
    "例：ロスター変更、契約終了…",
  "studio.endRepresentation.acknowledge":
    "以前の機関提出物と年表エントリは公開記録上で見えるままであることを理解しています。",
  "studio.toast.verificationRequestFailed":
    "検証リクエストを記録できませんでした。",
  "studio.toast.verificationRequestRecorded":
    "検証リクエストを記録しました。",
  "studio.toast.sessionEnded":
    "セッションが終了しました。続行するには再度サインインしてください。",
  "studio.toast.verificationIncomplete": "検証が完了しませんでした。",
  "studio.toast.custodyVerified": "保管ステップを年表上で検証しました。",
  "studio.toast.connectionInterrupted":
    "接続が中断されました。再接続してからスタジオを開いてください。",
  "studio.toast.contributionFailed": "貢献を提出できませんでした。",
  "studio.toast.contributionFiled": "作者性の貢献を年表に提出しました。",
  "studio.toast.contributionError": "貢献を提出できませんでした。",
  "studio.toast.confirmFailed": "確認できませんでした。",
  "studio.toast.confirmRecorded": "確認を記録しました。",
  "studio.toast.confirmError": "確認できませんでした。",
  "studio.toast.amendmentResolveFailed": "修正を処理できませんでした。",
  "studio.toast.amendmentAccepted": "修正を記録上で受理しました。",
  "studio.toast.amendmentDeclined": "修正を記録上で却下しました。",
  "studio.toast.amendmentResolveError": "修正を処理できませんでした。",
  "studio.toast.withdrawFailed": "取り下げできませんでした。",
  "studio.toast.amendmentWithdrawn": "修正を記録上で取り下げました。",
  "studio.toast.withdrawError": "取り下げできませんでした。",
  "studio.toast.endRepresentationFailed": "代表関係を終了できませんでした。",
  "studio.toast.representationEnded": "代表関係を記録上で終了しました。",
  "studio.toast.endRepresentationError": "代表関係を終了できませんでした。",
  "studio.toast.amendmentRequestFiled":
    "修正リクエストを年表に提出しました。",
  "studio.toast.activityLogFailed":
    "活動ログを書き込めませんでした。操作自体は記録されている可能性があります。",
  "studio.toast.claimApproveFailed": "申請を承認できませんでした。",
  "studio.toast.custodyLedgerFailed": "保管台帳を開けませんでした。",
  "studio.toast.custodyRowUpdateFailed": "保管行を更新できませんでした。",
  "studio.toast.custodyRowRecordFailed": "保管行を記録できませんでした。",
  "studio.toast.claimRecorded": "所有申請を年表に記録しました。",
  "studio.toast.claimWithdrawFailed": "申請を取り下げできませんでした。",
  "studio.toast.claimWithdrawn": "申請を審査から取り下げました。",
  "studio.toast.registerFailed": "作品を記録できませんでした。",
  "studio.toast.valueFilingFailed": "価値の記録ができませんでした。",
  "studio.toast.valueEventRecorded": "価値イベントを記録しました。",
  "studio.toast.buyerUuidInvalid": "購入者アカウントIDはUUIDである必要があります。",
  "studio.toast.buyerIdRequired": "購入者アカウントIDが必要です。",
  "studio.toast.buyerNameRequired": "この提出には購入者名が必要です。",
  "studio.toast.recordingTransfer": "移転を記録中…",
  "studio.toast.transferFailed": "移転を提出できませんでした：{error}",
  "studio.toast.transferOwnerUpdateFailed":
    "移転は記録されましたが、現在の所有者を自動更新できませんでした。",
  "studio.toast.transferContinued": "この移転の年表を続けました。",
  "studio.ledger.saleRecorded": "売却を記録",
  "studio.ledger.completeTransfer":
    "正確な来歴のため、所有移転を完了してください。",
  "studio.ledger.recordTransferDetails": "移転の詳細を記録",
  "studio.ledger.transferDetails": "移転の詳細",
  "studio.ledger.sellerPrefilled": "売主（事前入力）",
  "studio.ledger.sellerUserIdPlaceholder": "売主ユーザーID",
  "studio.ledger.buyer": "購入者",
  "studio.ledger.externalBuyer": "外部購入者",
  "studio.ledger.existingUser": "既存ユーザー",
  "studio.ledger.buyerUserIdPlaceholder": "購入者ユーザーID（UUID）",
  "studio.ledger.buyerNamePlaceholder": "購入者名",
  "studio.ledger.buyerType.collector": "コレクター",
  "studio.ledger.buyerType.gallery": "ギャラリー",
  "studio.ledger.buyerType.institution": "機関",
  "studio.ledger.buyerType.private": "個人",
  "studio.ledger.buyerType.unknown": "不明",
  "studio.ledger.externalBuyerNote": "外部購入者にアカウントは不要です。",
  "studio.ledger.saleType": "売却種別",
  "studio.ledger.saleTypePrimary": "一次",
  "studio.ledger.saleTypeSecondary": "二次",
  "studio.ledger.dateOfSale": "売却日",
  "studio.ledger.notes": "メモ",
  "studio.ledger.notesPlaceholder": "任意の補足（請求書、会場など）",
  "studio.ledger.saveTransfer": "移転を保存",
  "studio.ledger.title": "所有台帳",
  "studio.ledger.artworkFallback": "作品",
  "studio.ledger.valueHistorySubtitle":
    "この作品のすべての申告価値イベント。",
  "studio.ledger.noValueEvents": "まだ価値イベントが記録されていません。",
  "studio.ledger.noAdditionalContext": "追加の文脈なし",
  "studio.ledger.visibility": "公開範囲",
  "studio.ledger.ownershipHistory": "所有履歴",
  "studio.ledger.ownershipHistorySubtitle":
    "この作品のすべての移転と確認。",
  "studio.ledger.noOwnershipEvents": "まだ所有イベントが記録されていません。",
  "studio.ledger.currentOwner": "現在の所有者",
  "studio.ledger.claimedByYou": "あなたが所有を申請しました",
  "studio.ledger.claimedByOther": "別のコレクターが所有を申請しました",
  "studio.ledger.from": "移転元",
  "studio.ledger.requestVerification": "検証をリクエスト",
  "studio.ledger.submitting": "送信中…",
  "studio.ledger.verifyOwnership": "所有を検証",
  "studio.ledger.verifying": "検証中…",
  "studio.ledger.integrityNotes": "整合性メモ",
  "studio.ledger.integritySubtitle":
    "所有の経路における異常や特別な状況がここに表示されます。",
  "studio.ledger.noIntegrityData": "整合性データがありません。",
  "studio.ledger.integrityEventOn": "{date} · {type}",
  "studio.ledger.unknownOwner": "所有者不明",
  "studio.ledger.unknown": "不明",
  "studio.ledger.status.verified": "保有（検証済み）",
  "studio.ledger.status.claimed": "所有を申請",
  "studio.ledger.status.unassigned": "未割当",
  "studio.ledger.status.recorded": "所有を記録",
  "studio.ledger.valueType.sale": "売却を記録",
  "studio.ledger.valueType.auction": "オークションを記録",
  "studio.ledger.transferType.transfer": "所有移転",
  "studio.ledger.transferType.initial": "初期記録",
  "studio.ledger.transferType.correction": "記録の更新",
  "studio.ledger.transferType.sale": "売却",
  "studio.ledger.confirm.areYouSure": "続行してよろしいですか？",
  "studio.ledger.confirm.working": "処理中…",
  "studio.ledger.confirm.adminVerify.title": "この所有ステップを検証しますか？",
  "studio.ledger.confirm.adminVerify.body":
    "この所有移転を検証済みとしてマークしようとしています。レジストリに、この保有の変更が正しく、信頼できる永続的な履歴として扱われるべきであると示します。\n\n売却または移転の詳細を確認し、正確であると確信できる場合のみ続行してください。",
  "studio.ledger.confirm.adminVerify.confirm": "はい、所有を検証",
  "studio.ledger.confirm.requestVerification.title":
    "この移転の検証をリクエストしますか？",
  "studio.ledger.confirm.requestVerification.body":
    "この所有ステップを検証プロセスで前進させるよう求めています。そのリクエストは来歴の一部になります。\n\n移転の詳細が正しいと信じ、レビューを望む場合に使用してください。",
  "studio.ledger.confirm.requestVerification.confirm": "はい、リクエストを送信",
  "studio.insight.fallbackTitle": "インサイト",
  "studio.insight.loadingSeries": "記録上の系列を取得中…",
  "studio.insight.noSeriesData": "この期間の系列データがありません。",
  "studio.insight.howToRead": "読み方",
  "studio.insight.breakdownHeading": "内訳",
  "studio.insight.notesHeading": "メモ",
  "studio.insight.defaultValueLabel": "価値",
  "studio.insight.loadFailed":
    "このインサイトを読み込めませんでした。もう一度お試しください。",
  "studio.insight.title.worksArtist": "カタログのハイライト",
  "studio.insight.title.worksGallery": "カタログの推移",
  "studio.insight.title.health": "記録の健全性",
  "studio.insight.title.valueArtist": "価値の推移",
  "studio.insight.title.valueGallery": "申告価値",
  "studio.insight.line.worksArtist": "作品",
  "studio.insight.line.worksGallery": "累計作品",
  "studio.insight.breakdown.totalWorks": "作品総数",
  "studio.insight.breakdown.uniqueWorks": "ユニーク作品",
  "studio.insight.breakdown.unique": "ユニーク",
  "studio.insight.breakdown.editionWorks": "エディション作品",
  "studio.insight.breakdown.editions": "エディション",
  "studio.insight.breakdown.mostActivePeriod": "最も活発な期間",
  "studio.insight.breakdown.peakPeriod": "ピーク期間",
  "studio.insight.breakdown.fullyVerifiedStrict": "完全検証（厳格）",
  "studio.insight.breakdown.withCertificate": "証明書あり",
  "studio.insight.breakdown.missingVerification": "検証不足",
  "studio.insight.breakdown.latestDeclared": "最新申告（{currency}）",
  "studio.insight.bar.fullyVerified": "完全検証",
  "studio.insight.bar.certified": "認証済み",
  "studio.insight.bar.incomplete": "未完了",
  "studio.insight.note.healthNonAdditive":
    "これらの棒は加算されません。1作品が複数のカテゴリにカウントされる場合があります。",
  "studio.insight.note.healthStrictArtist":
    "「完全検証」には、失効していない証明書、ギャラリー証明、検証済み所有が必要です。この棒はスタジオ一覧の行ごとの「検証済み」バッジより厳格です。",
  "studio.insight.note.healthStrictGallery":
    "「完全検証」には、失効していない証明書、ギャラリー証明、検証済み所有が必要です。この棒は各作品の「検証済み」バッジより厳格です。",
  "studio.insight.note.valueBasisArtist":
    "数値は価値イベントからの通貨別最新申告価値（グラフ系列と同じ基準）であり、すべての作品の現在リスト価格の合算ではありません。",
  "studio.insight.note.valueBasisGallery":
    "数値は価値イベントからの通貨別最新申告価値（グラフ系列と同じ基準）であり、すべての作品の現在リスト価格の合算ではありません。",
  "studio.insight.subtitle.artist.catalogueSteadyGrowth":
    "カタログは着実に成長しています。",
  "studio.insight.subtitle.artist.clearOwnership":
    "カタログには明確な所有記録が示されています。",
  "studio.insight.subtitle.artist.ownershipPending":
    "一部の所有の連続性が記録上で保留中です。",
  "studio.insight.subtitle.artist.continuityNeeded":
    "記録を完成させるには、一部の作品に連続性の記録が必要かもしれません。",
  "studio.insight.subtitle.artist.valuesShifted":
    "最新の記録価値は以前の期間と比べて変化しています。",
  "studio.insight.subtitle.artist.valuesSteady":
    "最新の記録価値は以前のエントリと比べて安定しています。",
  "studio.insight.subtitle.artist.multiCurrencyTracked":
    "価値は複数の通貨で追跡されています。",
  "studio.insight.subtitle.artist.addValueEvent":
    "価値イベントを追加すると、ここに推移が表示されます。",
  "studio.insight.subtitle.artist.value.noEvents12mo":
    "過去12か月に価値イベントはありません。",
  "studio.insight.subtitle.artist.value.multiCurrency":
    "価値は複数通貨で追跡されています。各線は独自のスケールを使用します。",
  "studio.insight.subtitle.artist.value.trendingUp":
    "最新の記録価値は以前のエントリと比べて上昇傾向です。",
  "studio.insight.subtitle.artist.value.softened":
    "最新の記録価値は以前のエントリと比べて軟化しています。",
  "studio.insight.subtitle.artist.value.steady":
    "最新の記録価値は以前のエントリと比べて安定しています。",
  "studio.insight.subtitle.gallery.registrySteady":
    "代表作品全体でレジストリ活動は安定しています。",
  "studio.insight.subtitle.gallery.ownershipPending":
    "一部の所有の連続性が記録上で保留中です。",
  "studio.insight.subtitle.gallery.verificationSteady":
    "スタジオ全体で検証活動は安定しています。",
  "studio.insight.subtitle.gallery.recordsPending":
    "一部の記録がまだ保留中です。",
  "studio.insight.subtitle.gallery.value.noDeclared":
    "代表作品について、この期間に申告価値はありません。",
  "studio.insight.subtitle.gallery.value.multiCurrency":
    "申告価値はスタジオ全体で複数通貨にまたがります。",
  "studio.insight.subtitle.gallery.value.trendingUp":
    "最新の申告価値はスタジオ全体で上昇傾向です。",
  "studio.insight.subtitle.gallery.value.softened":
    "最新の申告価値は最近の期間で軟化しています。",
  "studio.insight.subtitle.gallery.value.steady":
    "申告価値は最近の期間で安定しています。",
  "studio.insight.subtitle.collector.ownershipPending":
    "一部の所有の連続性が記録上で保留中です。",
  "studio.insight.subtitle.collector.ownershipEstablished":
    "所有記録は十分に確立されています。",
  "studio.insight.subtitle.collector.multiCurrency":
    "コレクションは複数通貨で記録されています。",
  "studio.insight.subtitle.collector.consistentRecord":
    "コレクションは時間を通じて一貫した記録を示しています。",
  "studio.insight.subtitle.collector.value.noEvents":
    "この期間に記録された価値はありません。",
  "studio.insight.subtitle.collector.value.multiCurrency":
    "コレクションは複数通貨にまたがります。",
  "studio.insight.subtitle.collector.value.trendingUp":
    "最新の記録価値は上昇傾向です。",
  "studio.insight.subtitle.collector.value.softened":
    "最新の記録価値は軟化しています。",
  "studio.insight.subtitle.collector.value.steady":
    "記録価値は安定しています。",
  "studio.activity.artworkRegistered": "作品を登録：{title}",
  "studio.activity.valueUpdated": "価値を更新：{title}",
  "studio.activity.ownershipConfirmed": "所有を確認：{title}",
  "studio.activity.ownershipClaimRejected": "所有申請を却下",
  "studio.activity.authInviteSent":
    "{title}{registrySuffix} の認証招待を {email} に送信",
  "studio.activity.authenticatedAuthorship":
    "作者性を認証：{title}{registrySuffix}",
  "studio.activity.representationConfirmed":
    "代表を確認：{title}{registrySuffix}",
  "studio.activity.provenanceInitiated":
    "連続性移転を開始：{title}{registrySuffix} → {recipient}",
  "studio.activity.provenanceAccepted":
    "連続性移転を受理：{title}{registrySuffix}",
  "studio.activity.provenanceCompleted":
    "連続性移転を完了：{title}{registrySuffix}",
  "studio.activity.galleryInviteSent":
    "代表招待を {email} に送信",
  "studio.activity.accountDeletionRequested":
    "{email} のアカウント削除をリクエスト",
  "studio.activity.artworkVerified": "作品を検証：{title}{registrySuffix}",
  "studio.activity.certificateIssued": "証明書を発行：{title}{registrySuffix}",
  "studio.activity.artistOnboarded":
    "{artist} が {gallery} のレジストリオンボーディングを完了。",
  "studio.activity.personalArchiveAdded":
    "個人アーカイブに追加：{title}{registrySuffix}",
  "studio.activity.personalArchiveRemoved":
    "個人アーカイブから削除：{title}{registrySuffix}",
  "studio.activity.collectorOwnershipDeclared":
    "所有権宣言を記録：{title}{registrySuffix}",
  "studio.activity.galleryInviteAccepted": "ギャラリー招待を承諾",
  "studio.activity.unknown": "活動を記録",
  "registry.record.certificateOverview": "証明書の概要",
};

const BY_LANG: Record<Lang, Record<MessageKey, string>> = {
  en: EN,
  de: DE,
  fr: FR,
  ja: JA,
};

export function translate(key: MessageKey, lang: Region["lang"]): string {
  const table = BY_LANG[lang] ?? EN;
  return table[key] ?? EN[key];
}

export function fillMessage(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template
  );
}
