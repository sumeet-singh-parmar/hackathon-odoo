import { useMutation } from "@tanstack/react-query";
import type { UpdateMeInput } from "@hackathon/shared";
import * as profileApi from "@/features/profile/api/profile";

export function useUpdateProfile() {
  return useMutation({ mutationFn: (input: UpdateMeInput) => profileApi.updateProfile(input) });
}
