import { TouchableWithoutFeedback, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { Trans } from "@lingui/macro";
import { ErrorBoundary } from "react-error-boundary";

import { useSelf } from "~/app/settings/account";
import { useLists } from "../lists/context";
import { Text } from "../themed/text";
import { useDrawer } from "./context";

export const ActorDetails = () => (
  <ErrorBoundary fallback={<></>}>
    <ActorDetailsInner />
  </ErrorBoundary>
);

const ActorDetailsInner = () => {
  const setOpenDrawer = useDrawer();

  const { openFollows, openFollowers } = useLists();

  const { data: self } = useSelf();

  if (!self) return null;

  return (
    <View>
      <Link asChild href="/self" onPress={() => setOpenDrawer(false)}>
        <TouchableWithoutFeedback>
          <View>
            <Image
              source={{ uri: self.avatar }}
              alt={self.displayName}
              className="h-16 w-16 rounded-full bg-neutral-200 object-cover dark:bg-neutral-800"
              cachePolicy="memory-disk"
            />
            <View className="mt-2">
              <Text className="text-2xl font-semibold">{self.displayName}</Text>
              <Text className="mt-px text-base text-neutral-500 dark:text-neutral-400">{`@${self.handle}`}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Link>
      <View className="mt-3 flex-row flex-wrap">
        <TouchableOpacity onPress={() => openFollowers(self.did)}>
          <Text className="mr-4">
            <Trans>
              <Text className="font-bold">{self.followersCount}</Text> Followers
            </Trans>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openFollows(self.did)}>
          <Text>
            <Trans>
              <Text className="font-bold">{self.followsCount}</Text> Following
            </Trans>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
