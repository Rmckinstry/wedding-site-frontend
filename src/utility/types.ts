export type Group = {
    group_name: string;
    group_id: number;
}

export type Guest = {
  added_by_guest_id: null;
  additional_guest_type: null;
  email: string;
  group_id: number;
  guest_id: number;
  has_dependents: boolean;
  name: string;
  plus_one_allowed: boolean;
  song_requests: number;
};

export type GroupData = {
  group_name: string;
  guests: Guest[];
};

export type RSVP = {
    rsvp_id: number;
    guest_id: number;
    attendance: boolean;
    spotify: string;
    created_at: string;
    updated_at: string | null;
}