import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { type AppBskyActorDefs } from "@atproto/api";
import { useTheme } from "@react-navigation/native";
import { CircleUserIcon } from "lucide-react-native";

import { useAbsolutePath } from "~/lib/hooks/use-absolute-path";
import { cx } from "~/lib/utils/cx";

interface Props {
  profile: AppBskyActorDefs.ProfileViewBasic;
  avatarSize?: "normal" | "reduced";
}

export const PostAvatar = ({ profile, avatarSize = "normal" }: Props) => {
  const theme = useTheme();
  const path = useAbsolutePath();

  const profileHref = path(`/profile/${profile.did}`);

  return (
    <Link href={profileHref} asChild>
      <TouchableOpacity>
        {profile.avatar ? (
          <Image
            recyclingKey={profile.did}
            source={{ uri: profile.avatar }}
            alt={`@${profile.handle}`}
            className={cx(
              "shrink-0 rounded-full",
              {
                "h-10 w-10": avatarSize === "reduced",
                "h-12 w-12": avatarSize === "normal",
              },
              theme.dark ? theme.colors.card : "bg-neutral-300",
            )}
          />
        ) : (
          <View
            className={cx(
              "shrink-0 items-center justify-center rounded-full",
              {
                "h-10 w-10": avatarSize === "reduced",
                "h-12 w-12": avatarSize === "normal",
              },
              theme.dark ? theme.colors.card : "bg-neutral-400",
            )}
          >
            <CircleUserIcon size={32} color={theme.colors.text} />
          </View>
        )}
      </TouchableOpacity>
    </Link>
  );
};
