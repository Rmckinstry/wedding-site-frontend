export type Group = {
  group_name: string;
  id: number;
};

export type GroupData = {
  group_name: string;
  guests: Guest[];
};

export type Guest = {
  added_by_guest_id: null | string;
  additional_guest_type: null | string;
  email: string;
  group_id: number;
  guest_id: number;
  has_dependents: boolean;
  name: string;
  plus_one_allowed: boolean;
  song_requests: number;
};

export type RSVP = {
  rsvp_id: number;
  guest_id: number;
  attendance: boolean;
  spotify: string;
  created_at: string;
  updated_at: string | null;
};

export type ErrorType = {
  status: number;
  message: string;
  error?: string;
};

export type RSVPResponseType = {
  status?: number;
  message?: string;
  data?: {
    createdRSVPs: RSVP[];
    additionalGuests: AdditionalGuestResponseType[];
  };
};

export type AdditionalGuestResponseType = {
  guestInfo: Guest[];
  rsvpInfo: RSVP[];
};

export type CustomResponseType = {
  status?: number;
  message?: string;
  data?: any[];
};

export type SongRequestError = {
  title: boolean;
  artist: boolean;
  message: string;
};

export type AdditionalGuestType = "plus_one" | "dependent";

export type AdditionalGuest = {
  name: string;
  type: AdditionalGuestType;
  guestId: number;
};

export type AdditionalGuestBodyType = {
  groupId: number;
  additional: AdditionalGuest[];
};
