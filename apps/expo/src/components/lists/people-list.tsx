import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { type AppBskyActorDefs } from "@atproto/api";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { type UseInfiniteQueryResult } from "@tanstack/react-query";

import { useBottomSheetStyles } from "../../lib/bottom-sheet";
import { useUserRefresh } from "../../lib/utils/query";

type PeopleListResponse = {
  people: AppBskyActorDefs.ProfileView[];
  cursor: string | undefined;
};

export interface PeopleListRef {
  open: () => void;
}

interface Props {
  title: string;
  data: UseInfiniteQueryResult<PeopleListResponse, unknown>;
  onClose: () => void;
  limit?: number;
}

export const PeopleList = forwardRef<PeopleListRef, Props>(
  ({ title, data, onClose, limit }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { top } = useSafeAreaInsets();
    const [showAll, setShowAll] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        void data.refetch();
        setShowAll(false);
        bottomSheetRef.current?.snapToIndex(1);
      },
    }));

    const handleSheetChanges = (index: number) => {
      if (index === 0) {
        bottomSheetRef.current?.close();
      }
    };

    const { refreshing, handleRefresh, tintColor } = useUserRefresh(
      data.refetch,
    );

    const {
      backgroundStyle,
      handleStyle,
      handleIndicatorStyle,
      contentContainerStyle,
    } = useBottomSheetStyles();

    const people = useMemo(() => {
      if (!data.data) return [];
      return data.data.pages.flatMap((x) => x.people);
    }, [data.data]);

    return (
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        enablePanDownToClose
        snapPoints={[1, "60%", Dimensions.get("window").height - top - 10]}
        backdropComponent={BottomSheetBackdrop}
        onChange={handleSheetChanges}
        handleIndicatorStyle={handleIndicatorStyle}
        handleStyle={handleStyle}
        backgroundStyle={backgroundStyle}
        onClose={onClose}
      >
        <BottomSheetView style={[{ flex: 1 }, contentContainerStyle]}>
          <Text className="mt-2 text-center text-xl font-medium dark:text-white">
            {title}
          </Text>
          {data.data ? (
            <View className="mt-4 flex-1 dark:bg-black">
              <BottomSheetFlatList
                style={contentContainerStyle}
                data={people.slice(0, showAll ? undefined : limit)}
                renderItem={({ item }) => (
                  <PersonRow
                    person={item}
                    onPress={() => bottomSheetRef.current?.close()}
                  />
                )}
                keyExtractor={(item) => item.did}
                ItemSeparatorComponent={() => (
                  <View className="mx-4 h-px bg-neutral-200 dark:bg-neutral-600" />
                )}
                ListFooterComponent={() => (
                  <View className="h-24 w-full items-center justify-center px-4">
                    {limit && !showAll && people.length > limit && (
                      <TouchableOpacity onPress={() => setShowAll(true)}>
                        <Text className="text-center text-neutral-500 dark:bg-neutral-600">
                          {data.hasNextPage
                            ? "Show all"
                            : `Show ${people.length - limit} more`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                ListEmptyComponent={() => (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-center text-neutral-500 dark:bg-neutral-600">
                      There&apos;s nothing here...
                    </Text>
                  </View>
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => void handleRefresh()}
                    tintColor={tintColor}
                  />
                }
                onEndReachedThreshold={0.5}
                onEndReached={() =>
                  void (!limit || showAll || people.length < limit) &&
                  data.fetchNextPage()
                }
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
PeopleList.displayName = "PeopleList";

const PersonRow = ({
  person,
  onPress,
}: {
  person: AppBskyActorDefs.ProfileView;
  onPress: () => void;
}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-2"
      onPress={() => {
        router.push(`/profile/${person.handle}`);
        onPress();
      }}
    >
      <Image
        source={{ uri: person.avatar }}
        className="mr-4 h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800"
        alt={person.displayName}
      />
      <View className="flex-1">
        {person.displayName && (
          <Text className="text-base leading-5 dark:text-white">
            {person.displayName}
          </Text>
        )}
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          @{person.handle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
