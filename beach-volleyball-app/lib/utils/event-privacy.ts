interface PrivacySettings {
  hideFromParticipants: boolean
}

interface EventParticipant {
  userId: string
  name: string
  avatar?: string
  isHidden: boolean
  isOrganizer?: boolean
}

// Get privacy settings for current user
export function getPrivacySettings(): PrivacySettings {
  const settings = localStorage.getItem('privacy_settings')
  return settings ? JSON.parse(settings) : { hideFromParticipants: false }
}

// Check if user has privacy enabled
export function isUserPrivate(): boolean {
  const settings = getPrivacySettings()
  return settings.hideFromParticipants
}

// Get visible participants for an event
export function getVisibleParticipants(
  eventId: string,
  isViewerOrganizer: boolean = false
): { visible: EventParticipant[], hiddenCount: number } {
  // デモ用のモックデータ
  // 実際の実装では、サーバーから参加者リストを取得
  const allParticipants: EventParticipant[] = [
    {
      userId: "organizer",
      name: "主催者",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      isHidden: false,
      isOrganizer: true
    },
    {
      userId: "user1",
      name: "参加者1",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      isHidden: false
    },
    {
      userId: "user2",
      name: "参加者2",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      isHidden: true
    },
    {
      userId: "user3",
      name: "参加者3",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      isHidden: true
    }
  ]

  if (isViewerOrganizer) {
    // 主催者は全員見える
    return {
      visible: allParticipants,
      hiddenCount: 0
    }
  }

  // 一般参加者は非表示設定の人を見えない
  const visible = allParticipants.filter(p => !p.isHidden || p.isOrganizer)
  const hiddenCount = allParticipants.filter(p => p.isHidden && !p.isOrganizer).length

  return { visible, hiddenCount }
}

// Save privacy settings
export function savePrivacySettings(settings: PrivacySettings): void {
  localStorage.setItem('privacy_settings', JSON.stringify(settings))
}