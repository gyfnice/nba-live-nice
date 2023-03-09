import Head from "next/head";
import { useState, useEffect } from "react";

import {
  Center,
  Stack,
  Radio,
  RadioGroup,
  Flex,
  Spacer,
  Box,
  AbsoluteCenter,
  HStack,
  Heading,
  Divider,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { find } from "lodash";

import { backerballList, footballList } from '@/config/index.js';
import { Store } from '@/utils/index.js';
import styles from "./index.module.css";

export default function ListPage() {
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [list, setList] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("")
  const [query, setQuery] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checkvalue, setCheckvalue] = useState(null);
  useEffect(() => {
    const defaultValue = query || Store("queryName") || "lanqiu/nba";
    const targetItem = find(backerballList.concat(footballList), function(item) {
      return item.query === defaultValue;
    });
    setLoading(true);
    fetch("/api/nbaList", {
      method: "POST",
      body: JSON.stringify({ query: defaultValue }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        setDate(data.title);
        setList(data.list);
        setTitle(targetItem.name);
        setCheckvalue(defaultValue);
      })
      .catch((err) => {
        setLoading(false);
        setIsError(true);
        setDate("数据异常，刷新页面重试");
      });
    return () => {};
  }, [query]);
  const refresh = () => {
    window.location.reload();
  };
  const openLink = (link) => {
    window.open(link);
  };
  const onQueryChange = (value) => {
    setCheckvalue(value);
  }
  const saveQuery = () => {
    setQuery(checkvalue);
    Store("queryName", checkvalue);
    onClose();
  }
  return (
    <div>
      <Head>
        <title>每日比赛直播列表</title>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/dog.png" />
      </Head>
      {loading && (
        <div className={styles.spinning}>
          <div className={styles.spinner}></div>
          <span>数据加载中...</span>
        </div>
      )}
      <Box position="relative" h="60px">
        <Center bg="tomato" h="60px" color="white">
          <Heading>{title}</Heading>
        </Center>
        <Box position="absolute" left="10px" top="10px">
          <Button colorScheme="blue" onClick={onOpen}>
            切换
          </Button>
        </Box>
      </Box>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">赛事选择</DrawerHeader>
          <DrawerBody>
            <RadioGroup
              defaultValue={checkvalue || "lanqiu/nba"}
              onChange={onQueryChange}
            >
              <Stack>
                {backerballList.map((item) => {
                  return (
                    <Radio
                      key={item.name}
                      size="lg"
                      value={item.query}
                      colorScheme="orange"
                    >
                      {item.name}
                    </Radio>
                  );
                })}
                <Divider orientation="horizontal" />
                {footballList.map((item) => {
                  return (
                    <Radio
                      key={item.name}
                      size="lg"
                      value={item.query}
                      colorScheme="orange"
                    >
                      {item.name}
                    </Radio>
                  );
                })}
              </Stack>
            </RadioGroup>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button onClick={saveQuery} colorScheme="blue">
              确认
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <main className={styles.main}>
        <Center h="60px">
          <Heading>{date}</Heading>
        </Center>
        <Divider orientation="horizontal" />
        {isError && (
          <>
            <br />
            <div onClick={refresh} className={styles.button}>
              刷新页面
            </div>
          </>
        )}
        <div className={styles.timeline}>
          <div className={styles.timeline__line}></div>
          <div className={styles.timeline__items}>
            {list.map((item, index) => {
              return (
                <div key={index} className={styles.timeline__item}>
                  <div className={styles.timeline__top}>
                    <div className={styles.timeline__circle}>
                      <span className={styles.timeline__time}>
                        {item.time}
                      </span>
                    </div>

                    <div className={styles.timeline__title}>
                      <dl className={styles.property_list}>
                        <dt className={styles.property_list__key}>
                          <div className={styles.media_object}>
                            <div className={styles.media_object__media}>
                              <img
                                width="40"
                                height="40"
                                src={item.teamLeft.img}
                                alt=""
                              />
                            </div>
                            <div className={styles.media_object__content}>
                              {item.teamLeft.name}
                            </div>
                          </div>
                          <div className={styles.media_object}>
                            <div className={styles.media_object__media}>
                              <img
                                width="40"
                                height="40"
                                src={item.teamRight.img}
                                alt=""
                              />
                            </div>
                            <div className={styles.media_object__content}>
                              {item.teamRight.name}
                            </div>
                          </div>
                        </dt>
                        <dd className={styles.property_list__value}>
                          {item.liveLink && (
                            <div
                              onClick={() => openLink(item.liveLink)}
                              className={styles.button}
                            >
                              观看直播
                            </div>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>

                  <div className={styles.timeline__desc}></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.tips}>@copyright 2023</div>
      </main>
    </div>
  );
}
ListPage.getInitialProps = ({ query, req, res }) => {
  return {
    query: ""
  };
};
